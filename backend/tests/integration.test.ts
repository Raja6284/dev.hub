// // backend/tests/integration.test.ts
// import request from 'supertest';
// import {app} from '../server'; // Adjust if necessary
// import { describe, it } from 'node:test';

// describe('Integration Tests', () => {
//   let token: string;

//   it('1. POST /api/auth/signup - creates user', async () => {
//     const res = await request(app)
//       .post('/api/auth/signup')
//       .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
//     expect(res.status).toBe(200);
//     expect(res.body.token).toBeDefined();
//   });

//   it('2. POST /api/auth/login - logs in user', async () => {
//     const res = await request(app)
//       .post('/api/auth/login')
//       .send({ email: 'test@example.com', password: 'password123' });
//     expect(res.status).toBe(200);
//     expect(res.body.token).toBeDefined();
//     token = res.body.token;
//   });

//   it('3. GET /api/resources/trending - fetches and caches', async () => {
//     const res1 = await request(app)
//       .get('/api/resources/trending')
//       .set('Authorization', `Bearer ${token}`);
//     expect(res1.status).toBe(200);
//     const res2 = await request(app)
//       .get('/api/resources/trending')
//       .set('Authorization', `Bearer ${token}`);
//     expect(res2.body).toEqual(res1.body);
//   });

//   it('4. POST /api/posts - creates post', async () => {
//     const res = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ title: 'Test Post', content: '# Markdown', tags: ['test'] });
//     expect(res.status).toBe(200);
//     expect(res.body.title).toBe('Test Post');
//   });

//   it('5. GET /api/analytics - gets analytics', async () => {
//     const res = await request(app)
//       .get('/api/analytics')
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.status).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });
// });




import request from 'supertest';
import { app } from '../server';
import assert from 'assert';
import { describe, it } from 'node:test';

describe('Integration Tests', () => {
  let token: string;

  it('1. POST /api/auth/signup - creates user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
  });

  it('2. POST /api/auth/login - logs in user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    token = res.body.token;
  });

  it('3. GET /api/resources/trending - fetches and caches', async () => {
    const res1 = await request(app)
      .get('/api/resources/trending')
      .set('Authorization', `Bearer ${token}`);
    assert.strictEqual(res1.status, 200);
    const res2 = await request(app)
      .get('/api/resources/trending')
      .set('Authorization', `Bearer ${token}`);
    assert.deepStrictEqual(res2.body, res1.body);
  });

  it('4. POST /api/posts - creates post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Post', content: '# Markdown', tags: ['test'] });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.title, 'Test Post');
  });

  it('5. GET /api/analytics - gets analytics', async () => {
    const res = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${token}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});