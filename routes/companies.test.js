process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async function(){
	const result = await db.query(`INSERT INTO companies (code, name, description) VALUES 
	('tsla', 'Tesla', 'The Future') RETURNING code, name, description`)
	testCompany = result.rows[0];
});

afterEach(async function(){
	await db.query(`DELETE from companies`)
});

afterAll(async function(){
	await db.end();
});

describe('GET /companies', function(){
	test('Gets a list of all companies', async () => {
		const res = await request(app).get('/companies');
		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({ companies: [testCompany] });
	});
});

describe('GET /companies/:code', function(){
	test('Gets a single company', async () => {
		const res = await request(app).get(`/companies/${testCompany.code}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({ company: {...testCompany, industries: [null], invoices: []}  });
	});
	test('Responds with 404 for invalid code', async () => {
		const res = await request(app).get(`/companies/21`);
		expect(res.statusCode).toEqual(404);
	});
});

describe("POST /companies", () => {
  test("Creates a single company", async () => {
		let newCompany = { name: 'Yolo Industries', description: 'iykyk' };
    const res = await request(app).post('/companies').send(newCompany);
    expect(res.statusCode).toBe(201);
		newCompany.code = "yolo";
    expect(res.body).toEqual({ company: newCompany })
  })
})

describe("PATCH /companies/:code", () => {
  test("Updates a single company", async () => {
		let testCompanyChanges = { code: 'tsla', name: 'Tesla', description: 'iykyk bro' }
    const res = await request(app).patch(`/companies/${testCompany.code}`).send(testCompanyChanges);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ company: testCompanyChanges })
  });
	test('Responds with 404 for invalid code', async () => {
		const res = await request(app).patch(`/companies/22`).send("hi");
		expect(res.statusCode).toEqual(404);
	});
})

describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
		const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({status: "deleted"})
  });
	test('Responds with 404 for invalid code', async () => {
		const res = await request(app).delete(`/companies/23`);
		expect(res.statusCode).toEqual(404);
	});
})