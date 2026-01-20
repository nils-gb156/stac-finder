const { parseCql2Filter } = require('../../utils/filtering');

describe('CQL2 filter-lang handling', () => {

  test('cql2-text filter works', () => {
    const params = [];
    const { whereClause, error } = parseCql2Filter(
      "title LIKE '%Sentinel%'",
      'cql2-text',
      params
    );

    expect(error).toBeNull();
    expect(whereClause).toContain('ILIKE');
    expect(params).toEqual(['%Sentinel%']);
  });

  test('cql2-json filter works', () => {
    const params = [];
    const filter = JSON.stringify({
      op: '=',
      args: [{ property: 'license' }, 'CC-BY-4.0']
    });

    const { whereClause, error } = parseCql2Filter(
      filter,
      'cql2-json',
      params
    );

    expect(error).toBeNull();
    expect(whereClause).toContain('=');
    expect(params).toEqual(['CC-BY-4.0']);
  });

  test('invalid filter-lang returns error', () => {
    const params = [];
    const { error } = parseCql2Filter(
      "id = 'abc'",
      'cql3-text',
      params
    );

    expect(error).not.toBeNull();
    expect(error.status).toBe(400);
  });

});