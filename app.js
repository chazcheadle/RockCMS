import Express from 'express';

const { SERVER_PORT } = process.env;

const app = new Express();

app.get('/', (req, res) => res.send('Ok.'));

app.listen(SERVER_PORT);
