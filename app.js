import Express from 'express';
require('dotenv').config();

const { SERVER_PORT } = process.env;

const app = new Express();

app.get('/', (req, res) => res.send('Ok.'));

app.listen(SERVER_PORT);
