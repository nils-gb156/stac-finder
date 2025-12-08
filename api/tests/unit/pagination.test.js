const { parsePaginationParams, createPaginationToken, createPaginationLinks } = require('../../utils/pagination');

describe('Pagination Utils', () => {
  describe('parsePaginationParams', () => {
    test('should use default limit when not provided', () => {
      const result = parsePaginationParams({});
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    test('should parse limit correctly', () => {
      const result = parsePaginationParams({ limit: '20' });
      expect(result.limit).toBe(20);
    });

    test('should cap limit at maximum', () => {
      const result = parsePaginationParams({ limit: '99999' });
      expect(result.limit).toBe(10000);
    });

    test('should decode token correctly', () => {
      const token = createPaginationToken(50);
      const result = parsePaginationParams({ token });
      expect(result.offset).toBe(50);
    });

    test('should return error for invalid limit', () => {
      const result = parsePaginationParams({ limit: 'invalid' });
      expect(result.error).toBeDefined();
    });
  });

  describe('createPaginationLinks', () => {
    test('should create next link when full page', () => {
      const links = createPaginationLinks('/collections', {}, 0, 10, 10);
      const nextLink = links.find(l => l.rel === 'next');
      expect(nextLink).toBeDefined();
    });

    test('should not create next link when partial page', () => {
      const links = createPaginationLinks('/collections', {}, 0, 10, 5);
      const nextLink = links.find(l => l.rel === 'next');
      expect(nextLink).toBeUndefined();
    });

    test('should create prev link when not first page', () => {
      const links = createPaginationLinks('/collections', {}, 20, 10, 10);
      const prevLink = links.find(l => l.rel === 'prev');
      expect(prevLink).toBeDefined();
    });
  });
});