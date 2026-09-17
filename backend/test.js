const express = require('express')
const { Pool } = require('pg');
const app = express()
const port = 7050

const pool = new Pool({
    user: 'postgres',
    host: '10.10.10.67',
    database: 'postgres',
    password: 'Avaya123$',
    port: 5432,
  });
  
  app.use(express.json());

  async function createBanksTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS banks (
          id SERIAL PRIMARY KEY,
          account VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(255) NOT NULL

        );
      `;
  
      await pool.query(query);
      console.log('Banks table created');
    } catch (err) {
      console.error(err);
      console.error('Banks table creation failed');
    }
  }
  
  createBanksTable();

  app.post('/banks', async (req, res) => {
    // Validate the incoming JSON data
    const { account, name, phone } = req.body;
    console.log(req.body);
    if (!account || !name || !phone) {
      return res.status(400).send('One of the title, or artist, or price is missing in the data');
    }

    try {
      // try to send data to the database
      const query = `
        INSERT INTO banks (account, name, phone)
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
      const values = [account, name, phone];
  
      const result = await pool.query(query, values);
      res.status(201).send({ message: 'New Bank created', bankId: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).send('some error has occured');
    }
  });

  app.get('/banks', async (req, res) => {
    try {
      const query = 'SELECT * FROM banks;';
      const { rows } = await pool.query(query);
      res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('failed');
    }
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })