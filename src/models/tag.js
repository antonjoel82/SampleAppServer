const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const { MAX_TAG_LABEL_LENGTH, MAX_SUMMARY_LENGTH } = require('../constants.js');

const TagSchema = new Schema({
  _id: { type: String, maxlength: MAX_TAG_LABEL_LENGTH }, // this is the tag's label
  summary: { type: String, maxlength: MAX_SUMMARY_LENGTH },
  creator: ObjectId, // User._id
  created: { type: Date, default: Date.now },
  resourceCount: { type: Number, default: 0 },
  searches: { type: Number, default: 0 }
});

// Also enable the _id field to be accessed as the label (which it represents)
TagSchema.virtual('label').get(function () {
  return this._id;
});

TagSchema.index({
  _id: 'text',
  summary: 'text'
});

var Tag = mongoose.model('Tag', TagSchema);

module.exports = {
  TagSchema, Tag
};
