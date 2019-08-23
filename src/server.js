/* Libraries */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const { DEFAULT_PORT } = require('./constants.js');
const { User } = require('../src/models/user.js');
const { Resource } = require('../src/models/resource.js');
const { Tag } = require('../src/models/tag.js');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const activePort = process.env.PORT || DEFAULT_PORT;
const server = app.listen(activePort, () => {
  console.debug(`App is up and running on Port ${activePort}`);
});

const dburl = 'mongodb://localhost:27017/restTest';

// Mongoose Deprecations
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connect(dburl, { useNewUrlParser: true })
  .then(() => {
    console.debug('Successfully connected to MongoDB.');
  })
  .catch(err => {
    console.error(`Connecting to MongoDB failed: ${err}`);
  });

mongoose.connection.on('error', err => {
  console.error(`Lost connection to MongoDB: ${err}`);
});

app.get('*', (req, res) => {
  return res.status(200).send({ message: 'Welcome to the back-end!' });
});

app.get('/', (req, res) => {
  res.json('Hitting Root Page.');
});

app.post('/register', (req, res) => {
  return registerNewUser(req, res);
});

app.post('/signin', (req, res) => {
  return handleLogin(req, res);
});

app.post('/upload', (req, res) => {
  return handleUpload(req, res);
});

app.post('/tag', (req, res) => {
  return createNewTag(req, res);
});

/**
 * Processes a request to create a new tag, creates it, and returns the newly-created tag.
 * @param {*} req
 * @param {*} res
 */
function createNewTag (req, res) {
  const { label, summary, creator } = req.body;

  Tag.create({ _id: label, summary, creator }, function (err, tag) {
    if (err || !tag) {
      console.warn(`Could not create the tag with label '${label}'.`);
      return res.status(400).json(`Could not create the tag with label '${label}'. Please try again.`);
    }
    return res.status(201).json(tag);
  });
}

/**
 * Processes a request to create a new resource, creates it, and returns the newly-created resource.
 * @param {*} req
 * @param {*} res
 */
function handleUpload (req, res) {
  return new Resource();
}

/**
 * Processes a REST request to login a user. Returns partial User Document if successful.
 * @param {*} req
 * @param {*} res
 */
function handleLogin (req, res) {
  const { login, password } = req.body;
  const condition = { $or: [{ email: login.toLowerCase() }, { username: login.toLowerCase() }] };

  User.findOne(condition, function verifyUserWithPassword (err, user) {
    if (err || !user) {
      return res.status(400).json('Could not login the specified user with the credentials provided.');
    }

    user.comparePassword(password, function (err, isMatch) {
      if (err) {
        console.debug('Passwords could not be verified. ', err);
        return res.status(400).json('Could not login the specified user with the credentials provided.');
      } else if (!isMatch) {
        console.warn('Passwords didn\'t match...');
        return res.status(400).json('Could not login the specified user with the credentials provided.');
      } else {
        console.debug(`User pre-update login time: ${user.lastLogin}`);

        updateLastLoginForUser(user, (err, updatedUser) => {
          if (err) {
            console.warn(err);
            return res.status(400).json('Could not complete login. Please try again.');
          }
          console.debug(`User post-update login time: ${updatedUser.lastLogin}`);
          return res.status(200).json(updatedUser);
        });
      }
    });
  });
}

/**
 * Updates the last login time for the provided user to the current time
 * @param {User} user
 * @param {function} cb
 */
function updateLastLoginForUser (user, cb) {
  if (!user) {
    console.debug('No user specified to update lastLogin time.');
    return cb(new Error('No user specified to update lastLogin time.'), user);
  }

  User.findOneAndUpdate({ _id: user._id }, { lastLogin: Date.now() }, { fields: User.getClientProjection(), new: true }, function (err, updatedUser) {
    if (err) {
      console.debug("Could not update user's updated lastLogin time.");
      return cb(err, user);
    }
    if (!updatedUser) {
      console.debug("Could not update user's updated lastLogin time.");
      return cb(err, user);
    }
    return cb(null, updatedUser);
  });
}

/**
 * Create a new user from the specified request.
 * @param {*} req
 * @param {*} res
 */
function registerNewUser (req, res) {
  const { email, username, password, name } = req.body;
  const userToSave = new User({
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    hash: password,
    name
  });

  userToSave.save((err, user) => {
    if (err) {
      console.debug('Could not create user. ', err);
      return res.status(400).json(`Could not register new user. Reason: ${err.detail}`);
    }

    // Remove the hashed password from the object sent to the client
    user.hash = undefined;

    console.debug('Registered new user: ', user);
    return res.status(201).json(user);
  });
}

module.exports = server;
