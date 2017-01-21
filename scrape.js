const textract = require('textract');
const request = require('request');
const google = require('./google');

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

  const options = {
    url: 'https://www.textrazor.com/demo/process/',
    headers: headers,
    method: 'POST',
    form: body
  };

  return new Promise((resolve, reject) => {
    const callback = (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        return resolve(info);
        console.log(JSON.stringify(info, null, 2));
      } else {
        return reject(error);
      }
    };

    request('https://www.textrazor.com/demo/process/', options, callback);
  });
};

const extractText = (url) => {
  return new Promise((resolve, reject) => {
    textract.fromUrl(url, (error, text) => {
      if (error) return reject(error);

      return resolve(text);
    });
  });
};

const filter = (url) => {
  return new Promise((resolve, reject) => {
    const textList = extractText(url).then(text => {
      //console.log(text);
      const nlpData = nlp(text).then(nlp => {
        const nlpFiltered = nlp.response.topics.filter(elem => {
          return elem.label.includes('English');
        });

        return resolve(url);
      });
    });
  });
};

google('sat questions english sentence vocabulary exam test site:.edu filetype:pdf').then(urls => {
    Promise.all(urls.map(filter)).then(cleanURLs => {
      console.log('cleanUrls: ', cleanURLs);
    });
  });
