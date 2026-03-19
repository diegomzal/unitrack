const request = require('supertest');
const app = require('../index');

describe('GET /', () => {
    it('should return a 200 health check response', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Welcome to UniTrack API' });
    });
});
