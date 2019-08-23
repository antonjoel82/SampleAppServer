const { describe, it, before, after } = require('mocha');
const mongoose = require('mongoose');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../src/server.js');

const DBTests = require('./db-tests.js');
const { User } = require('../src/models/user.js');

const dbUrl = 'mongodb://localhost:27017/test';

chai.use(chaiHttp);
chai.use(dirtyChai);

describe('Test', () => {
  describe('testing MochaJS functionality', () => {
    it('should return \'Testing the test framework #meta\'', (done) => {
      const test = DBTests.testMocha();
      expect(test).to.be.a('string');
      expect(test).to.equal('Testing the test framework #meta');
      done();
    });
  });
});

describe('MongoDB Connection', () => {
  describe('Test proper DB URL', () => {
    it('should connect successfully to MongoDB and should not throw an error', (done) => {
      expect(() => mongoose.connect(dbUrl, { useNewUrlParser: true })).to.not.throw();

      // Close the connection
      mongoose.disconnect(done);
    });
  });
});

describe('MongoDB Single Store / Retrieval', () => {
  before(done => {
    mongoose.connect(dbUrl, { useNewUrlParser: true }).catch((err) => console.error(err));
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function () {
      console.debug('We are connected to test database!');
      done();
    });
  });

  // describe('Save new User', () => {
  //   it('should successfully save a new user.', (done) => {
  //     assert.doesNotThrow(() => DBTests.saveUser(DBTests.createNewUser(), done));
  //   });
  // });

  describe('Register new user', () => {
    it('should successfully save a new user.', (done) => {
      chai.request(server)
        .post('/register')
        .send(DBTests.registerNewUserRequest())
        .end((err, res) => {
          expect(err).to.be.null();

          expect(res).to.have.status(201);
          expect(res.body).to.be.a('object');
          expect(res.body.username).to.equal('joelcore');
          expect(res.body.email).to.equal('joel@gmail.com');
          expect(res.body.password).to.be.undefined();
          expect(res.body.hash).to.be.undefined();
          done();
        });
    });
  });

  describe('Retrieve created User', () => {
    it('retrieves the newly created User with email joel@gmail.com, username joelcore', (done) => {
      chai.request(server)
        .post('/signin')
        .send(DBTests.loginUserRequest())
        .end((err, res) => {
          expect(err).to.be.null();

          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body.username).to.equal('joelcore');
          expect(res.body.email).to.equal('joel@gmail.com');
          expect(res.body.password).to.be.undefined();
          expect(res.body.hash).to.be.undefined();
          done();
        });
    });
  });

  // Close the connection after everything is done
  after(done => {
    mongoose.connection.db.dropCollection(User.collection.name, () => {
      return mongoose.connection.close(done);
    });
  });
});
