// api/utils/cql2sql.js
function astToSql(ast, queryableMap, params) {
    const nextParam = (v) => {
      params.push(v);
      return `$${params.length}`;
    };
  
    const resolveColumn = (ident) => {
      const q = queryableMap[ident.name];
      if (!q) throw new Error(`Unknown queryable: ${ident.name}`);
      return q;
    };
  
    const mapCompare = (node) => {
      const q = resolveColumn(node.left);
      const col = q.column;
  
      // LIKE only for text
      if (node.op === 'LIKE') {
        if (q.type !== 'text') throw new Error(`LIKE not supported for ${node.left.name}`);
        const p = nextParam(String(node.right.value));
        return `${col} ILIKE ${p}`;
      }
  
      // basic comparisons for scalar types
      if (q.type === 'text') {
        const p = nextParam(String(node.right.value));
        const op = node.op === '!=' ? '<>' : node.op;
        return `${col} ${op} ${p}`;
      }
  
      if (q.type === 'timestamptz') {
        // accept ISO date-time as string literal in CQL
        const p = nextParam(String(node.right.value));
        const op = node.op === '!=' ? '<>' : node.op;
        return `${col} ${op} ${p}::timestamptz`;
      }
  
      throw new Error(`${node.op} not supported for ${node.left.name} (type ${q.type})`);
    };
  
    const mapIn = (node) => {
      const q = resolveColumn(node.left);
      const col = q.column;
  
      const values = node.values.map(v => v.value);
  
      if (q.type === 'text') {
        // scalar IN (...) -> col = ANY($n::text[])
        const p = nextParam(values.map(String));
        return `${col} = ANY(${p}::text[])`;
      }
  
      if (q.type === 'text_array') {
        // array column IN (...) -> overlap operator && with ARRAY param
        const p = nextParam(values.map(String));
        return `${col} && ${p}::text[]`;
      }
  
      throw new Error(`IN not supported for ${node.left.name} (type ${q.type})`);
    };
  
    const mapBetween = (node) => {
      const q = resolveColumn(node.left);
      const col = q.column;
  
      if (q.type === 'timestamptz') {
        const p1 = nextParam(String(node.low.value));
        const p2 = nextParam(String(node.high.value));
        return `${col} BETWEEN ${p1}::timestamptz AND ${p2}::timestamptz`;
      }
  
      // optional: numeric later
      if (q.type === 'text') {
        // BETWEEN on text usually weird; disallow
        throw new Error(`BETWEEN not supported for text field ${node.left.name}`);
      }
  
      throw new Error(`BETWEEN not supported for ${node.left.name} (type ${q.type})`);
    };

    const mapSpatial = (node) => {
      const q = resolveColumn(node.left);
      const col = q.column;

      if (q.type !== 'geometry') {
        throw new Error(`Spatial operator ${node.op} requires geometry field, got ${q.type}`);
      }

      // Parse BBox geometry from right side: { type: "BBox", value: [minX, minY, maxX, maxY] }
      if (!node.right || node.right.type !== 'Literal') {
        throw new Error('Spatial operator requires BBox literal');
      }

      const bbox = node.right.value;
      if (!bbox || typeof bbox !== 'object' || bbox.type !== 'BBox' || !Array.isArray(bbox.value) || bbox.value.length < 4) {
        throw new Error('Invalid BBox format: expected {type: "BBox", value: [minX, minY, maxX, maxY]}');
      }

      const [minX, minY, maxX, maxY] = bbox.value.map(Number);
      if ([minX, minY, maxX, maxY].some(isNaN)) {
        throw new Error('BBox coordinates must be numbers');
      }

      // Create PostGIS envelope for the bounding box
      const bboxParam = nextParam(`POLYGON((${minX} ${minY}, ${maxX} ${minY}, ${maxX} ${maxY}, ${minX} ${maxY}, ${minX} ${minY}))`);
      const geom = `ST_GeomFromText(${bboxParam}, 4326)`;

      // Map CQL2 spatial operators to PostGIS functions
      switch (node.op) {
        case 'S_INTERSECTS':
          return `ST_Intersects(${col}, ${geom})`;
        case 'S_CONTAINS':
          return `ST_Contains(${col}, ${geom})`;
        case 'S_OVERLAPS':
          return `ST_Overlaps(${col}, ${geom})`;
        case 'S_WITHIN':
          return `ST_Within(${col}, ${geom})`;
        default:
          throw new Error(`Unsupported spatial operator: ${node.op}`);
      }
    };
  
    const walk = (node) => {
      switch (node.type) {
        case 'Logical':
          return `(${walk(node.left)} ${node.op} ${walk(node.right)})`;
        case 'Not':
          return `(NOT ${walk(node.expr)})`;
        case 'Compare':
          return `(${mapCompare(node)})`;
        case 'In':
          return `(${mapIn(node)})`;
        case 'Between':
          return `(${mapBetween(node)})`;
        case 'Spatial':
          return `(${mapSpatial(node)})`;
        default:
          throw new Error(`Unknown AST node: ${node.type}`);
      }
    };
  
    return walk(ast);
  }
  
  module.exports = { astToSql };
  