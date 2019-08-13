/* Libraries */
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const mongoose = require('mongoose');

const { DEFAULT_PORT, SALT_FACTOR } = require('./constants.js');
const { User } = require('../src/models/user.js');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const activePort = process.env.PORT || DEFAULT_PORT;
app.listen(activePort, () => {
  console.log(`App is up and running on Port ${activePort}`);
});

const dburl = 'mongodb://localhost:27017/restTest';

// Mongoose Deprecations
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connect(dburl, { useNewUrlParser: true })
  .then(() => {
    console.log('Successfully connected to MongoDB.');
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

app.post('/signin', function (req, res) {
  return handleLogin(req, res);
});

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
        return res.status(400).json('Passwords didn\'t match...');
      } else {
        console.debug(`User pre-update login time: ${user.lastLogin}`);

        updateLastLoginForUser(user, (err, updatedUser) => {
          if (err) {
            console.warn(err);
            return res.status(400).json('Could not complete login. Please try again.');
          }
          console.log(`User post-update login time: ${updatedUser.lastLogin}`);
          return res.json(updatedUser);
        });
      }
    });
  });
}

function updateLastLoginForUser (user, cb) {
  if (!user) {
    console.debug('No user specified to update lastLogin time.');
    return cb(new Error('No user specified to update lastLogin time.'), user);
  }

  User.findOneAndUpdate({ _id: user._id }, { lastLogin: Date.now() }, { returnNewDocument: true }, (err, updatedUser) => {
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

  // bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
  //   if (err) {
  //     return res.status(400).json(`Could not generate salt for new user. Reason: ${err.detail}`);
  //   }

  //   // Pass null as 3rd arg due to "progress" param being unused
  //   bcrypt.hash(password, salt, null, (err, hash) => {
  //     if (err) {
  //       return res.status(400).json(`Could not generate hash for new user. Reason: ${err.detail}`);
  //     }
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

    console.debug('Registered new user: ', user);

    return res.json(user);
  });
  //   });
  // });
}
