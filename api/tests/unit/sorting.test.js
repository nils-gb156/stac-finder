const { parseSortby } = require('../../utils/sorting');

describe('Sorting Utils', () => {
  const allowedColumns = ['id', 'title', 'description'];

  test('should parse ascending sort', () => {
    const result = parseSortby('title', allowedColumns);
    expect(result.orderByClauses).toEqual(['title ASC']);
  });

  test('should parse descending sort', () => {
    const result = parseSortby('-title', allowedColumns);
    expect(result.orderByClauses).toEqual(['title DESC']);
  });

  test('should parse multiple fields', () => {
    const result = parseSortby('+title,-id', allowedColumns);
    expect(result.orderByClauses).toEqual(['title ASC', 'id DESC']);
  });

  test('should return error for invalid field', () => {
    const result = parseSortby('invalid_field', allowedColumns);
    expect(result.error).toBeDefined();
  });
});