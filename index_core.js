const express = require("express")
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const path = require("path");
const compression = require("compression");
const fs = require('fs');
const cors = require('cors');
const helper = require('./helper')();

const app = express();

let ejs = require('ejs');
//let engine = require('ejs-locals');
//app.engine('ejs', engine);
//app.set('views', './pages');
//app.set('view engine', 'ejs');

const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    // Will not compress responses, if this header is present
    return false;
  }
  // Resort to standard compression
  return compression.filter(req, res);
};

app.use(cors());
// Compress all HTTP responses
app.use(compression({
  // filter: Decide if the answer should be compressed or not,
  // depending on the 'shouldCompress' function above
  filter: shouldCompress,
  // threshold: It is the byte threshold for the response 
  // body size before considering compression, the default is 1 kB
  threshold: 0
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Origin');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});

app.use(express.static(path.join(__dirname, "/frontend/build")));

app.get(`/api/status`, (req, res) => {

  var hash = {
    message: "Service started",
  };

  res.json(hash);

});

app.all(`/api/makeinv`, (req, res) => {

  const data = helper.getFile("./frontend/build/invoice.html");

  let formdata = JSON.parse(req.body.datajson || "{}");
  let size = req.body.PageSize || "small";

  console.log(size);

  const html = ejs.render(
      data,
      formdata,
      (err, str) => {
        if (err) return req.next(err);
        console.log(err);
      });

  helper.genPDF({ html }, { width: 1024, height: 1448, size }, req, res);

});

app.get(`/api/*`, (req, res) => {
  res.json({
    message: "no route for " + req.path
  });
});

// set client router response
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/frontend/build', 'index.html'));
});

module.exports = app;
