\c biztime

DROP TABLE IF EXISTS invoices
CASCADE;
DROP TABLE IF EXISTS companies
CASCADE;
DROP TABLE IF EXISTS industries
CASCADE;
DROP TABLE IF EXISTS companies_industries
CASCADE;



CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
		code text PRIMARY KEY,
		name text NOT NULL UNIQUE
);

CREATE TABLE companies_industries (
		comp_code text NOT NULL REFERENCES companies,
		ind_code text NOT NULL REFERENCES industries,
		PRIMARY KEY(comp_code, ind_code)
);



INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
				 ('tsla', 'Tesla', 'The FUTURE!!');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null),
				 ('tsla', '9000000', true, '2013-05-22'),
				 ('tsla', '69420', false, null);

INSERT INTO industries
  VALUES ('tech', 'Technology'),
         ('cloud', 'Cloud computing'),
				 ('ai', 'Artificial intelligence'),
				 ('media', 'Media'),
				 ('retail', 'Retail'),
				 ('fintech', 'Financial technology'),
				 ('energy', 'Energy generation'),
				 ('auto', 'automobiles'),
				 ('autonomy', 'Autonomous vehicles');

INSERT INTO companies_industries
	VALUES ('apple', 'tech'),
  			 ('apple', 'cloud'),
  			 ('apple', 'ai'),
  			 ('apple', 'media'),
  			 ('apple', 'retail'),
				 ('apple', 'fintech'),
				 ('ibm', 'tech'),
  			 ('ibm', 'cloud'),
  			 ('ibm', 'ai'),
				 ('tsla', 'tech'),
				 ('tsla', 'cloud'),
				 ('tsla', 'ai'),
				 ('tsla', 'retail'),
				 ('tsla', 'energy'),
				 ('tsla', 'auto'),
				 ('tsla', 'autonomy');


-- SELECT c.code, c.name, c.description, i.name
-- FROM companies AS c
-- LEFT JOIN companies_industries AS ci
-- ON c.code = ci.comp_code
-- LEFT JOIN industries AS i
-- ON ci.ind_code = i.code
-- WHERE c.code = 'apple';

-- SELECT i.code, i.name, ci.comp_code
-- FROM industries AS i
-- LEFT JOIN companies_industries AS ci
-- ON i.code = ci.ind_code;

-- SELECT i.code, i.name, array_agg(ci.comp_code) AS comp_codes
-- FROM industries AS i
-- LEFT JOIN companies_industries AS ci
-- ON i.code = ci.ind_code
-- GROUP BY i.code;