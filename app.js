const connection = require("./db-config");

require('dotenv').config();

const express = require('express');
const Joi = require('joi');
const app = express();

app.use(express.json());

const { setupRoutes } = require('./routes');

setupRoutes(app);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
  } else {
    console.log('connected to database with threadId :  ' + connection.threadId);
  }
});
app.use(express.json());