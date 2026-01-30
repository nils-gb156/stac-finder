// api/utils/cql2sql.js

function astToSql(ast, queryableMap, params) {
  const nextParam = (v) => {
    params.push(v);
    return `$${params.length}`;
  };

  const resolveColumn = (ident) => {
    const q = queryableMap[ident.name];
    if (!q) {
      throw new Error(`Unknown queryable: ${ident.name}`);
    }
    return q;
  };

  const mapCompare = (node) => {
    const q = resolveColumn(node.left);

    // virtual fields
    if (q.type === 'temporal_extent') {
      throw new Error('Use BETWEEN for temporal_extent filtering');
    }

    const col = q.column;
    const op = node.op === '!=' ? '<>' : node.op;

    // LIKE only for text
    if (node.op === 'LIKE') {
      if (q.type !== 'text') {
        throw new Error(`LIKE not supported for ${node.left.name}`);
      }
      const p = nextParam(String(node.right.value));
      return `${col} ILIKE ${p}`;
    }

    // scalar text
    if (q.type === 'text') {
      const p = nextParam(String(node.right.value));
      return `${col} ${op} ${p}`;
    }

    // timestamps
    if (q.type === 'timestamptz') {
      const p = nextParam(String(node.right.value));
      return `${col} ${op} ${p}::timestamptz`;
    }

    throw new Error(`${node.op} not supported for ${node.left.name} (type ${q.type})`);
  };

  const mapIn = (node) => {
    const q = resolveColumn(node.left);

    // virtual fields
    if (q.type === 'temporal_extent') {
      throw new Error('IN not supported for temporal_extent');
    }

    const col = q.column;
    const values = node.values.map(v => v.value);

    // scalar text: col = ANY(text[])
    if (q.type === 'text') {
      const p = nextParam(values.map(String));
      return `${col} = ANY(${p}::text[])`;
    }

    // array column: overlap
    if (q.type === 'text_array') {
      const p = nextParam(values.map(String));
      return `${col} && ${p}::text[]`;
    }

    throw new Error(`IN not supported for ${node.left.name} (type ${q.type})`);
  };

  const mapBetween = (node) => {
    const q = resolveColumn(node.left);

    // ---- temporal_extent (virtual) ----
    if (q.type === 'temporal_extent') {
      const low = nextParam(String(node.low.value));
      const high = nextParam(String(node.high.value));

      // overlap: [temporal_start, temporal_end] intersects [low, high]
      return `(temporal_start <= ${high}::timestamptz AND temporal_end >= ${low}::timestamptz)`;
    }

    const col = q.column;

    // timestamp BETWEEN
    if (q.type === 'timestamptz') {
      const p1 = nextParam(String(node.low.value));
      const p2 = nextParam(String(node.high.value));
      return `${col} BETWEEN ${p1}::timestamptz AND ${p2}::timestamptz`;
    }

    throw new Error(`BETWEEN not supported for ${node.left.name} (type ${q.type})`);
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
      default:
        throw new Error(`Unknown AST node: ${node.type}`);
    }
  };

  return walk(ast);
}

module.exports = { astToSql };