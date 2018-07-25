import Express from 'express';

require('dotenv').config();

const { API_PORT } = process.env;

const app = new Express();

// Load endpoint routes.
const endpoints = require('./api/endpoints');

app.use('/api', endpoints.video);
app.use('/api', endpoints.taxonomy);

app.get('/api', (req, res) => res.send('API Ok.'));

app.listen(API_PORT);
