
const fs = require('fs');

const helper = () => {

  const getFile = (path) => {
    if (fs.existsSync(path)) {
      return fs.readFileSync(path, 'utf8');
    }else{
      throw new Error(`file (${path}) does not exists `);
    }
  }

  const genPDF = async (htmlURL, pdfOptions = { width: 595, height: 842 }, req, res) => {
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
    }else{
      options = {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
        headless: true,
        defaultViewport: {
            width             : 1024,
            height            : 1448,
            deviceScaleFactor : 1
        },
      }
    }

    console.log("options");

    let browser = await puppeteer.launch(options);

    console.log("page");

    let page = await browser.newPage();

    console.log("html");

    let response;

    if(htmlURL && htmlURL.file){
      response = await page.setContent(htmlURL.html);
      //, {
      //  waitUntil: 'domcontentloaded'
      //});
    }else if(htmlURL && htmlURL.html){
      response = await page.setContent(htmlURL.html);
      //, {
      //  waitUntil: 'domcontentloaded'
      //});
    }else if(htmlURL && htmlURL.url){
      response = await page.goto(htmlURL.url);
      //, {
      //  waitUntil: 'networkidle2'
      //});
    }

    console.log("response");

    // If the page doesn't return a successful response code, we fail the check
    if(htmlURL && htmlURL.url && response.status() > 399) {
      console.log(`Failed with response code ${response.status()}`);
      throw new Error(`Failed with response code ${response.status()}`)
    }

    console.log("page pdf");

    let pdf = await page.pdf({
      format: 'A4',
      margin: { left: '1cm', top: '1cm', right: '1cm', bottom: '1cm' },
      printBackground: true,
      width: 1024,
      height: 1448,
    });

    console.log("page pdf 2");

    await page.close()
    await browser.close();

    res.setHeader('Content-type', 'application/pdf');
    res.setHeader('isBase64Encoded', true);
    // pdf = pdf.toString('base64');
    res.status(200).send(pdf);
  }

  return {
    getFile,
    genPDF
  }
}

module.exports = helper;
