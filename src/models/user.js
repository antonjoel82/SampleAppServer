const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const { SALT_FACTOR } = require('../constants.js');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
  email: { type: String, index: true, unique: true },
  username: { type: String, index: true, unique: true, maxlength: 20 },
  hash: { type: String, required: true },
  name: {
    first: String,
    last: String
  },
  joined: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  uploads: [ObjectId], // Resource._id
  favs: [ObjectId], // Resource.id
  ratings: [{
    rsrc: ObjectId,
    score: Number,
    date: { type: Date, default: Date.now }
  }]
});

// fields / projection to prevent hash from being sent to client
UserSchema.statics.getClientProjection = function () {
  return '-hash';
};

UserSchema.methods.comparePassword = function (submittedPass, cb) {
  return bcrypt.compare(submittedPass, this.hash, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

UserSchema.pre('save', function (next) {
  // Only need to hash the password if it's new or been modified
  if (!this.isModified('hash')) {
    return next();
  }

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      console.error(`Could not generate salt for new user. Reason: ${err.detail}`);
      return next(err);
    }

    // Pass null as 3rd arg due to "progress" param being unused
    bcrypt.hash(this.hash, salt, null, (err, hash) => {
      if (err) {
        console.error(`Could not generate hash for new user. Reason: ${err.detail}`);
        return next(err);
      }

      this.hash = hash;
      next();
    });
  });
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  UserSchema, User
};
