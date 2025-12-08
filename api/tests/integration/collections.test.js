const request = require('supertest');
const app = require('../../app');

describe('GET /collections', () => {
  test('should return collections with default pagination', async () => {
    const res = await request(app).get('/collections');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('collections');
    expect(res.body).toHaveProperty('links');
    expect(res.body.collections.length).toBeLessThanOrEqual(10);
  });

  test('should respect limit parameter', async () => {
    const res = await request(app).get('/collections?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.collections.length).toBeLessThanOrEqual(5);
  });

  test('should return 400 for invalid limit', async () => {
    const res = await request(app).get('/collections?limit=invalid');
    expect(res.status).toBe(400);
  });

  test('should include next link when more results exist', async () => {
    const res = await request(app).get('/collections?limit=2');
    const nextLink = res.body.links.find(l => l.rel === 'next');
    expect(nextLink).toBeDefined();
    expect(nextLink.href).toContain('token=');
  });

  test('should navigate with token', async () => {
    const res1 = await request(app).get('/collections?limit=2');
    const nextLink = res1.body.links.find(l => l.rel === 'next');
    
    const res2 = await request(app).get(nextLink.href);
    expect(res2.status).toBe(200);
    expect(res2.body.collections).toBeDefined();
  });

  test('should sort collections', async () => {
    const res = await request(app).get('/collections?sortby=title');
    expect(res.status).toBe(200);
  });
});