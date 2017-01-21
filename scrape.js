const textract = require('textract');
const request = require('request');
const google = require('./google');
const excludedTerms = ['instructors'];

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

const hasExcludedTerm = (text) => {
  const lowerCaseText= text.toLowerCase();

  for(let i = 0; i < excludedTerms.length; i++) {
    const term = excludedTerms[i];

    if (lowerCaseText.includes(term)) {
      return true;
    }
  }

  return false;
};

const filter = (url) => {
  return new Promise((resolve, reject) => {
    extractText(url).then(text => {

      if (hasExcludedTerm(text)) {
        resolve(null);
      }

      nlp(text).then(nlp => {
        nlp.response.topics.filter(elem => {
          return elem.label.includes('Exam') && elem.score === 1;
        });

        resolve(url);
      }).catch(resolve);
    });
  })};

google('sat questions english sentence vocabulary exam test site:.edu filetype:pdf').then(urls => {
    Promise.all(urls.map(filter)).then(cleanURLs => {
      console.log('cleanUrls: ', cleanURLs);
    }).catch(e => {
      console.log('ERROR: ', e);
    });
  });
