const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT id, comp_code FROM invoices`);
		return res.json({invoices: results.rows});

	} catch (e) {
		return next(e);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const result = await db.query(`SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description 
		FROM invoices AS i
		INNER JOIN companies AS c ON (i.comp_code = c.code)  
		WHERE id = $1`, [id]);

		if (result.rows.length === 0){
			throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
		}

		const inv = result.rows[0];
		
		return res.json({invoice: {
			id: inv.id,
			amt: inv.amt,
			paid: inv.paid,
			add_date: inv.add_date,
			paid_date: inv.paid_date,
			company: {
				code: inv.comp_code,
        name: inv.name,
        description: inv.description
			}
		}});

	} catch (e) {
		return next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const {comp_code, amt} = req.body;
		const results = await db.query(`INSERT INTO invoices (comp_code, amt)
		VALUES ($1, $2)
		RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);

		return res.status(201).json({invoice: results.rows[0]});

	} catch (e) {
		return next(e);
	}
});

router.patch('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt, paid } = req.body;

		const curData = await db.query(`
      SELECT paid_date
      FROM invoices
      WHERE id = $1`,
    [id]);

		if (curData.rows.length === 0){
			throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
		}

		let paidDate;
		const curPaidDate = curData.rows[0].paid_date;

		if (!curPaidDate && paid) paidDate = new Date();
		else if (!paid) paidDate = null;
		else paidDate = curPaidDate;

		const results = await db.query(`UPDATE invoices
			SET amt=$1, paid=$2, paid_date=$3
			WHERE id=$4
			RETURNING id, comp_code, amt, paid, add_date, paid_date`,
		[amt, paid, paidDate, id]);

		return res.status(201).json({invoice: results.rows[0]});

	} catch (e) {
		return next(e);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query(`DELETE FROM invoices
		WHERE id = $1
		RETURNING id`, [id]);

		if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
		
		return res.json({status: "deleted"});

	} catch (e) {
		return next(e);
	}
});



module.exports = router;