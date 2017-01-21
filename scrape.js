const _ = require('lodash')
const textract = require('textract');
const request = require('request');
const google = require('./google');
const excludedTerms = ['instructors'];
const mongoose = require('mongoose');
var Exam = require('./model/Exam');


const mongoUri = process.env.MONGODB_URI || 'mongodb://pennapps:iamacoolpasswordforpennapps@138.197.64.250:27017/';
mongoose.connect(mongoUri);

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
      if (!error && response.statusCode==200) {
        const info = JSON.parse(body);

        return resolve(info);
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
  const lowerCaseText = text.toLowerCase();

  for (let i = 0; i < excludedTerms.length; i++) {
    const term = excludedTerms[i];

    if (lowerCaseText.includes(term)) {
      return true;
    }
  }

  return false;
};

const getQuestions = (text) => {
  let questions = [];
  let firstCount = text.match(/ [A-Z\d]\. /g);
  let secondCount = text.match(/ \([A-Z\d]\) /g);
  firstCount = firstCount && firstCount.length || 0;
  secondCount = secondCount && secondCount.length || 0;

  if (firstCount > secondCount) {
    let exam = text.match(/\b(\d{1,2})\.\s\D*(?:(?!\b\d{1,3}\.\s)\d+\D*)*/g);
    exam = _.filter(exam, exam => !/[@]*(SAMPLE)/g.test(exam) && exam.length > 150)

    _.each(exam, exam => {
      let question = exam.replace(/\d+[(.]\s*/g, '');

      let choices = [];
      if (question.match(/ [A-Ea-e\d][.)] .*/g)) {
        choices = _.map(_.filter(question.match(/ [A-Ea-e\d][.)] .*/g)[0].split(/ [A-Ea-e\d][.)]/g), text => text!==""), text => text.trim());

        choices = _.filter(choices, choice => choice.length < 50);

        if (choices.length > 2 && choices.length < 5) {
          questions.push({
            question: question.replace(/\b[A-Z][.)].*/g, ''),
            choices
          });
        }
      }
    });
  }

  return questions
};

const filter = (url) => {
  return new Promise((resolve, reject) => {
    extractText(url).then(text => {

      if (hasExcludedTerm(text)) {
        resolve(null);
      }

      nlp(text).then(nlp => {
        nlp.response.topics.filter(elem => {
          return elem.label.includes('Exam') && elem.score===1;
        });



        const questions = getQuestions(text);
        if (questions.length) {
          const E = new Exam({url, text, tags: _.filter(nlp.response.topics, topic => topic.score === 1), questions});

          E.save((err) => {});
          resolve(E);
        }
      }).catch(resolve);
    });
  })
};

const searchExams = (term) => {
  google(term + ' sample exam test questions site:.edu filetype:pdf')
    .then(urls => Promise.all(urls.map(filter)))
    .then(() => mongoose.connection.close())
    .catch(err => console.error(err));
};

_.each(['history', 'law', 'biology'], term => searchExams(term));
