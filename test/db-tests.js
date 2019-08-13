const {User} = require("../src/models/user.js");

function testMocha() {
	return "Testing the test framework #meta";
}

function createNewUser() {
	return new User({
		email: "joel@gmail.com",
		username: "joelcore",
		hash: "ultimate2019",
		name: {first: "Joel", last: "CORE" },
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