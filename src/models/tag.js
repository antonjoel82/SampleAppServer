const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const TagSchema = new Schema({
  label: String,
  description: String,
  creator: ObjectId, // User._id
  created: { type: Date, default: Date.now },
  resourceCount: { type: Number, default: 0 },
  searches: { type: Number, default: 0 }
});

var Tag = mongoose.model('Tag', TagSchema);

module.exports = {
  TagSchema, Tag
};
