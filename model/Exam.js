// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var examSchema = new Schema({
  text: { type: String },
  url : { type: String },
  tags: { type: Array },
  questions: { type: Array },
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Exam = mongoose.model('Exam', examSchema);

// make this available to our users in our Node applications
module.exports = Exam;