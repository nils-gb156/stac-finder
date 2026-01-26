const { parseCql2Filter } = require('../../utils/filtering');

describe('CQL2-Text Spatial Operator Tests', () => {
  describe('Spatial Operators', () => {
    test('should parse S_INTERSECTS function', () => {
      const filter = "S_INTERSECTS(spatial_extent, BBOX(7.5, 51.9, 7.7, 52.0))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Intersects');
    });

    test('should parse S_CONTAINS function', () => {
      const filter = "S_CONTAINS(spatial_extent, BBOX(7.5, 51.9, 7.7, 52.0))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Contains');
    });

    test('should parse S_OVERLAPS function', () => {
      const filter = "S_OVERLAPS(spatial_extent, BBOX(7.5, 51.9, 7.7, 52.0))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Overlaps');
    });

    test('should parse S_WITHIN function', () => {
      const filter = "S_WITHIN(spatial_extent, BBOX(5.8, 47.2, 15.0, 55.1))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Within');
    });

    test('should handle lowercase spatial function names', () => {
      const filter = "s_intersects(spatial_extent, BBOX(7.5, 51.9, 7.7, 52.0))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Intersects');
    });

    test('should parse BBOX with decimal coordinates', () => {
      const filter = "S_INTERSECTS(spatial_extent, BBOX(7.123, 51.456, 7.789, 52.012))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
    });

    test('should parse BBOX with negative coordinates', () => {
      const filter = "S_INTERSECTS(spatial_extent, BBOX(-10.5, -20.3, -5.2, -15.1))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
    });
  });

  describe('Complex Combined Filters', () => {
    test('should parse spatial AND property filter', () => {
      const filter = "S_INTERSECTS(spatial_extent, BBOX(7.5, 51.9, 7.7, 52.0)) AND license = 'other'";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Intersects');
      expect(result.whereClause).toContain('AND');
    });

    test('should parse spatial OR property filter', () => {
      const filter = "S_WITHIN(spatial_extent, BBOX(5.8, 47.2, 15.0, 55.1)) OR license = 'proprietary'";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Within');
      expect(result.whereClause).toContain('OR');
    });

    test('should parse multiple spatial functions', () => {
      const filter = "S_INTERSECTS(spatial_extent, BBOX(7.5, 51.9, 7.7, 52.0)) OR S_CONTAINS(spatial_extent, BBOX(8.0, 50.0, 9.0, 51.0))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Intersects');
      expect(result.whereClause).toContain('ST_Contains');
    });

    test('should parse nested logical operators with spatial', () => {
      const filter = "(license = 'proprietary' OR license = 'other') AND S_WITHIN(spatial_extent, BBOX(5.8, 47.2, 15.0, 55.1))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Within');
    });

    test('should parse spatial with LIKE and temporal filters', () => {
      const filter = "S_INTERSECTS(spatial_extent, BBOX(7.5, 51.9, 7.7, 52.0)) AND title LIKE 'Sentinel%' AND temporal_start > '2024-01-01T00:00:00Z'";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeNull();
      expect(result.whereClause).toBeTruthy();
      expect(result.whereClause).toContain('ST_Intersects');
    });
  });

  describe('Error Handling', () => {
    test('should reject unknown spatial function', () => {
      const filter = "S_UNKNOWN(spatial_extent, BBOX(7.5, 51.9, 7.7, 52.0))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeTruthy();
    });

    test('should reject missing BBOX in spatial function', () => {
      const filter = "S_INTERSECTS(spatial_extent, 'not-a-bbox')";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeTruthy();
    });

    test('should reject incomplete BBOX coordinates', () => {
      const filter = "S_INTERSECTS(spatial_extent, BBOX(7.5, 51.9))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeTruthy();
    });

    test('should reject spatial function on non-geometry field', () => {
      const filter = "S_INTERSECTS(title, BBOX(7.5, 51.9, 7.7, 52.0))";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toContain('geometry');
    });

    test('should reject invalid syntax', () => {
      const filter = "invalid syntax here";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeTruthy();
    });

    test('should reject unknown queryable field', () => {
      const filter = "unknown_field = 'value'";
      const result = parseCql2Filter(filter, 'cql2-text', []);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toContain('Unknown queryable');
    });
  });
});
