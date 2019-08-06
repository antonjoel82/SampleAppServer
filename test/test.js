const assert = require('assert');
const mongoose = require("mongoose");

const DBTests = require("./db-tests.js")
const {Tag, User, Resource} = require("../src/schema.js");

const dbUrl = "mongodb://localhost:27017/test";

//Sample Mocha test
// describe('Array', function() {
//   describe('#indexOf()', function() {
//     it('should return -1 when the value is not present', function() {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });

describe("Test", () => {
	describe("testing MochaJS functionality", () => {
		it("should return 'Testing the test framework #meta'", () => {
			assert.equal(DBTests.testMocha(), "Testing the test framework #meta");
		})
	})
});

describe("MongoDB Connection", () => {
	describe("Test proper DB URL", () => {
		it("should connect successfully to MongoDB and should not throw an error", (done) => {
			assert.doesNotThrow(() => mongoose.connect(dbUrl, {useNewUrlParser: true}), "Failed to connect.");

			//Close the connection
			mongoose.disconnect(done);
		})
	});
});

describe("MongoDB Operations", () => {
	before(done => {
		mongoose.connect(dbUrl, {useNewUrlParser: true}).catch((err) => console.error(err));
		const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function() {
      console.log('We are connected to test database!');
      done();
    });
	})

	describe("Save new User", () => {
		it("should successfully save a new user.", (done) => {
			assert.doesNotThrow(() => DBTests.saveUser(DBTests.createNewUser(), done));
		})
	});

	describe("Retrieve created User", () => {
		it("retrieves the newly created User with email joel@gmail.com, username joelcore", (done) => {
			User.findOne({email: "joel@gmail.com"}, (err, user) => {
				if (err) throw err;

				assert.equal(user.username, DBTests.createNewUser().username);
				done();
			});
		});
	});

	//Close the connection after everything is done
	after(done => {
		mongoose.connection.db.dropCollection(User.collection.name, () => {
			return mongoose.connection.close(done);
		});
	});
});

