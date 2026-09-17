require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 7050;

app.use(cors());
app.use(express.json());

function createPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }

  if (!process.env.DB_PASSWORD) {
    console.warn('Warning: set DATABASE_URL (Neon) or DB_PASSWORD for local PostgreSQL.');
  }

  return new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'doasis',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });
}

const pool = createPool();

async function createmyselfTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS myself (
        equip_id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        university VARCHAR(255) NOT NULL
      );
    `;
    await pool.query(query);
    console.log('myself table created');
  } catch (err) {
    console.error(err);
    console.error('myself table creation failed');
  }
}

createmyselfTable();

// POST route
app.post('/myself', async (req, res) => {
  const { first_name, last_name, role, department, university } = req.body;
  console.log(req.body);
  if (!first_name || !last_name || !role || !department || !university) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const query = `
      INSERT INTO myself (first_name, last_name, role, department, university)
       VALUES ($1, $2, $3, $4, $5)
      RETURNING equip_id;
    `;
    const values = [first_name, last_name, role, department, university];

    const result = await pool.query(query, values);
    res.status(201).send({ message: 'New Myself created', equip_id: result.rows[0].equip_id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Some error has occurred');
  }
});

// GET route
app.get('/myself', async (req, res) => {
  const { first_name } = req.query;
  try {
    let query, values;
    if (first_name) {
      query = 'SELECT * FROM myself WHERE first_name = $1;';
      values = [first_name];
    } else {
      query = 'SELECT * FROM myself;';
      values = [];
    }
    const { rows } = await pool.query(query, values);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
