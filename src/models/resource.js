const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const { ResourceTypes, Sources } = require('../enum.js');
const { MAX_SUMMARY_LENGTH, MAX_DESCRIPTION_LENGTH } = require('../constants.js');

const ResourceSchema = new Schema({
  title: String,
  summary: { type: String, maxlength: MAX_SUMMARY_LENGTH },
  description: { type: String, maxlength: MAX_DESCRIPTION_LENGTH },
  type: {
    type: String,
    enum: Object.values(ResourceTypes)
  },
  source: {
    type: String,
    enum: Object.values(Sources)
  },
  link: { type: String, unique: true }, // prevent users from uploading duplicates
  vidTimestamp: Number, // timestamp to start video at in seconds
  uploader: ObjectId, // User._id
  author: String,
  uploaded: { type: Date, default: Date.now },
  created: Date,
  tags: [ String ], // these Strings represent the Tag _ids / labels
  comments: [{
    body: String,
    author: ObjectId, // User._id
    created: { type: Date, default: Date.now }
  }],
  meta: {
    avgScore: Number,
    ratings: [Number],
    favs: Number
  }
});
Object.assign(ResourceSchema.statics, { ResourceTypes, Sources });

ResourceSchema.index({
  title: 'text',
  summary: 'text'
});

const Resource = mongoose.model('Resource', ResourceSchema);

module.exports = {
  ResourceSchema, Resource
};
