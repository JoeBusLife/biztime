const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
	try {
		const industries = await db.query(
			`SELECT i.code, i.name, array_agg(ci.comp_code) AS companies
			FROM industries AS i
			LEFT JOIN companies_industries AS ci
			ON i.code = ci.ind_code
			GROUP BY i.code`
		);
		// const free = await db.query(`SELECT * FROM `)
		return res.json({industries: industries.rows});

	} catch (e) {
		return next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const {code, name} = req.body;
		const results = await db.query(`INSERT INTO industries (code, name)
		VALUES ($1, $2)
		RETURNING code, name`, [code, name]);
		
		return res.status(201).json({industry: results.rows[0]});

	} catch (e) {
		return next(e);
	}
});



module.exports = router;