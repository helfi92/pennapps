const google = require('google');

module.exports = (term) => {
  google.resultsPerPage = 50;
  let nextCounter = 0;
  let results = [];

  return new Promise((resolve, reject) => {
    google(term, function (err, res){
      if (err) return reject(err);

      for (let i = 0; i < res.links.length; ++i) {
        const link = res.links[i].href;

        if (link.match(/pdf$/)) {
          results.push(link);
        } else {
          console.log(link);
        }

      }
      return resolve(results);
      // if (nextCounter < 4) {
      //   nextCounter += 1;
      //   if (res.next) res.next();
      // }
    });
  });
};
