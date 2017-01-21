const textract = require('textract');
var fetch = require('node-fetch');
var request = require('request');

const url = 'http://people.math.sc.edu/sharpley/math142/Tests/Test1_sample.pdf';

const nlp = (text) => {
  const body = {
    "apiKey": "DEMO",
    "extractors": ["entities", "topics"].join(","),
    "entityExtractionOptions[filterEntitiesToDBPediaTypes]": null,
    "entityExtractionOptions[filterEntitiesToFreebaseTypes]": null,
    "entityExtractionOptions[allowOverlap]": null,
    "text": text,
    "classifiers": "textrazor_iab"
  };

  const headers = {
    "Host": "www.textrazor.com",
    "Origin": "https://www.textrazor.com",
    "Referer": "https://www.textrazor.com/demo",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  console.log('preparing to fetch...');

  var options = {
    url: 'https://www.textrazor.com/demo/process/',
    headers: headers,
    method: 'POST',
    form: body
  };

  const callback = (error, response, body) => {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      console.log(JSON.stringify(info, null, 2));
    }
  };

  request('https://www.textrazor.com/demo/process/', options, callback);
};

const extractText = (url) => {
  return new Promise((resolve, reject) => {
    textract.fromUrl(url, (error, text) => {
      if (error) reject(error);

      resolve(text);
      console.log(text);
      return text
    });
  });
};

const nlpData = extractText(url).then(text => nlp(text));
