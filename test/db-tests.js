const {Tag, User, Resource} = require("../src/schema.js");

function testMocha() {
	return "Testing the test framework #meta";
}

function createNewUser() {
	return new User({
		email: "joel@gmail.com",
		username: "joelcore",
		hash: "sde78y9hdhy938fh9w824fh",
		lastLogin: Date.now(),
		uploads: [],
		favs: [],
		ratings: [],
	});
}

function saveUser(user, done) {
	user.save(done);
}

module.exports = {
	testMocha,
	createNewUser,
	saveUser,
}