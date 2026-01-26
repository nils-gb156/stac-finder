const { parseCql2Filter } = require('../../utils/filtering');

describe('CQL2-JSON Spatial Operator Tests', () => {
  describe('Spatial Operators', () => {
    test('should parse s_intersects operator', () => {
      const filter = JSON.stringify({
        op: 's_intersects',
        args: [
          { property: 'spatial_extent' },
          { type: 'BBox', value: [7.5, 51.9, 7.7, 52.0] }
        ]
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Intersects');
    });

    test('should parse s_contains operator', () => {
      const filter = JSON.stringify({
        op: 's_contains',
        args: [
          { property: 'spatial_extent' },
          { type: 'BBox', value: [7.5, 51.9, 7.7, 52.0] }
        ]
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Contains');
    });

    test('should parse s_overlaps operator', () => {
      const filter = JSON.stringify({
        op: 's_overlaps',
        args: [
          { property: 'spatial_extent' },
          { type: 'BBox', value: [7.5, 51.9, 7.7, 52.0] }
        ]
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Overlaps');
    });

    test('should parse s_within operator', () => {
      const filter = JSON.stringify({
        op: 's_within',
        args: [
          { property: 'spatial_extent' },
          { type: 'BBox', value: [5.8, 47.2, 15.0, 55.1] }
        ]
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Within');
    });

    test('should reject invalid BBox format', () => {
      const filter = JSON.stringify({
        op: 's_intersects',
        args: [
          { property: 'spatial_extent' },
          { type: 'BBox', value: [7.5, 51.9] } // only 2 coordinates
        ]
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toContain('BBox');
    });

    test('should reject spatial operator on non-geometry field', () => {
      const filter = JSON.stringify({
        op: 's_intersects',
        args: [
          { property: 'title' }, // not a geometry field
          { type: 'BBox', value: [7.5, 51.9, 7.7, 52.0] }
        ]
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toContain('geometry');
    });
  });

  describe('Complex Combined Filters', () => {
    test('should parse spatial AND property filter', () => {
      const filter = JSON.stringify({
        op: 'and',
        args: [
          { op: 's_intersects', args: [
            { property: 'spatial_extent' },
            { type: 'BBox', value: [7.5, 51.9, 7.7, 52.0] }
          ]},
          { op: '=', args: [{ property: 'license' }, 'other'] }
        ]
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Intersects');
      expect(result.whereClause).toContain('AND');
    });

    test('should parse nested logical operators with spatial', () => {
      const filter = JSON.stringify({
        op: 'and',
        args: [
          {
            op: 'or',
            args: [
              { op: '=', args: [{ property: 'license' }, 'proprietary'] },
              { op: '=', args: [{ property: 'license' }, 'other'] }
            ]
          },
          { op: 's_within', args: [
            { property: 'spatial_extent' },
            { type: 'BBox', value: [5.8, 47.2, 15.0, 55.1] }
          ]}
        ]
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Within');
    });
  });

  describe('Error Handling', () => {
    test('should reject unknown operator', () => {
      const filter = JSON.stringify({
        op: 'unknown_op',
        args: [{ property: 'title' }, 'test']
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toContain('Unsupported');
    });

    test('should reject invalid JSON', () => {
      const filter = '{ invalid json }';
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeTruthy();
    });

    test('should reject unknown queryable field', () => {
      const filter = JSON.stringify({
        op: '=',
        args: [{ property: 'unknown_field' }, 'value']
      });
      const result = parseCql2Filter(filter, 'cql2-json', []);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toContain('Unknown queryable');
    });
  });
});
