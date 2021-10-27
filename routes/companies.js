const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

const slugify = require("slugify")

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM companies`);
		return res.json({companies: results.rows});

	} catch (e) {
		return next(e);
	}
});

router.get('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const resCompany = await db.query(`
			SELECT c.code, c.name, c.description, i.name AS industry
			FROM companies AS c
			LEFT JOIN companies_industries AS ci
			ON c.code = ci.comp_code
			LEFT JOIN industries AS i
			ON ci.ind_code = i.code
			WHERE c.code = $1`, [code]);

		if (resCompany.rows.length === 0){
			throw new ExpressError(`Can't find company with code of ${code}`, 404)
		}

		const resInvoice = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code])


		const {industry, ...company} = resCompany.rows[0];
		// const {code, name, description} = resCompany.rows[0];
		// const company = {code, name, description}
		company.industries = resCompany.rows.map(r => r.industry)

    const invoices = resInvoice.rows;
    company.invoices = invoices.map(inv => inv.id);

		return res.json({company: company});

	} catch (e) {
		return next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const code = slugify(name, {lower: true, strict: true}).split('-')[0];
		const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
		return res.status(201).json({company: results.rows[0]});

	} catch (e) {
		return next(e);
	}
});

router.patch('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const results = await db.query(`UPDATE companies SET code=$1, name=$2, description=$3 WHERE code = $1 RETURNING code, name, description`, [code, name, description]);
		if (results.rows.length === 0){
			throw new ExpressError(`Can't find company with code of ${code}`, 404)
		}
		return res.status(201).json({company: results.rows[0]});

	} catch (e) {
		return next(e);
	}
});

router.delete('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await db.query(`DELETE FROM companies
		WHERE code = $1
		RETURNING code`, [code]);
		
		if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }

		return res.json({status: "deleted"});

	} catch (e) {
		return next(e);
	}
});

router.post('/:code', async function addIndustryToCompany(req, res, next) {
	try {
		const comp_code  = req.params.code;
		const ind_code = req.body.code;
		const results = await db.query(`INSERT INTO companies_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code`, [comp_code, ind_code]);
		return res.status(201).json({company_industry: results.rows[0]});

	} catch (e) {
		return next(e);
	}
});

module.exports = router;