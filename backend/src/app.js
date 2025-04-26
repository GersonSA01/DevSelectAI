const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bienvenido a DevSelectAI - Backend en funcionamiento ");
});

module.exports = app;
