const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
	email: {type: String, index: true, unique: true},
	username: {type: String, index: true, unique: true},
	hash: {type: String, required: true},
	name: {
		first: String,
		last: String
	},
	joined: {type: Date, default: Date.now},
	lastLogin: {type: Date, default: Date.now},
	uploads: [ObjectId], //Resource._id
	favs: [ObjectId], //Resource.id
	ratings: [{
		rsrc: ObjectId,
		score: Number,
		date: {type: Date, default: Date.now}
	}],
});

UserSchema.methods.comparePassword = (submittedPass) => {
	return bcrypt.compare(submittedPass, this.hash);
};

const User = mongoose.model("User", UserSchema);

module.exports = {
	UserSchema, User
};
