const express = require("express")
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const path = require("path");
//const dataRoute = require("./routes_curd");
//const fileRoute = require("./routes_upload");
const compression = require("compression");
//const bot = require('./bot');
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

//app.use("/api/mydata", dataRoute);
//app.use("/api/images", fileRoute);
//app.use("/images", express.static(path.join(__dirname, "/images")));

app.use(express.static(path.join(__dirname, "/frontend/build")));

app.get(`/api/status`, (req, res) => {

  var hash = {
    message: "Server started",
  };

  console.log(hash);

  res.json(hash);

});

app.all(`/api/html1`, (req, res) => {

  const data = helper.getFile("./frontend/build/invoice.html");

  let formdata = JSON.parse(req.body.datajson || "{}");

  const html = ejs.render(
      data,
      formdata,
      (err, str) => {
        if (err) return req.next(err);
        console.log(err);
      });

  console.log("html");

  helper.genPDF({ html }, { width: 1024, height: 1448 }, req, res)

});

app.get(`/api/html2`, (req, res) => {
  res.json({
    message: 'html2',
  });
});

app.get(`/api/invoice`, async (req, res) => {

  res.json({
    message: "Invoice Routed",
  });

  return;

  let chrome = {};
  let puppeteer;

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
  } else {
    puppeteer = require("puppeteer");
  }

  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  //const data = helper.getFile("./frontend/build/invoice.html");

  //const html = ejs.render(
  //    data,
  //    {
  //      "companyname": "Company Name Here",
  //      "message": "Server started",
  //    },
  //    (err, str) => {
  //      if (err) return req.next(err);
  //      console.log(err);
  //    });

  let browser = await puppeteer.launch(options);

  let page = await browser.newPage();

  //const response = await page.goto("https://www.google.com");
  const response = await page.setContent("<html><title>pdf page</title><body>page test</body></html>");

  // If the page doesn't return a successful response code, we fail the check
  if (response.status() > 399) {
    throw new Error(`Failed with response code ${response.status()}`)
  }

  let pdf = await page.pdf({
    format: 'A4',
    margin: { left: '1cm', top: '1cm', right: '1cm', bottom: '1cm' },
    printBackground: true,
    width: 780,
    height: 1115,
  });

  await page.close()
  await browser.close();

  res.setHeader('Content-type', 'application/pdf');
  res.setHeader('isBase64Encoded', true);
  // pdf = pdf.toString('base64');
  res.status(200).send(pdf);

  //res.json({
  //  message: "Invoice Routed",
  //  chrome: chrome,
  //});

});

app.post(`/api/form`, (req, res) => {
  res.json({
    message: JSON.parse(req.body.datajson)
  });
});

//{"message":[["_readableState","_events","_eventsCount","_maxListeners","socket","httpVersionMajor","httpVersionMinor","httpVersion","complete","rawHeaders","rawTrailers","aborted","upgrade","url","method","statusCode","statusMessage","client","_consuming","_dumped","next","baseUrl","originalUrl","_parsedUrl","params","query","res","body","_body","length","route"]]}

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
