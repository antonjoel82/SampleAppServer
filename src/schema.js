const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const {ResourceTypes} = require("./enum.js");

const tagSchema = new Schema({
	label: String,
	description: String,
	creator: ObjectId, //User._id
	created: {type: Date, default: Date.now},
	resourceCount: {type: Number, default: 0},
	searches: {type: Number, default: 0},
});

//Schema definitions
const resourceSchema = new Schema({
	title: String,
	summary: String,
	description: String,
	type: {
		type: String,
		enum: Object.values(ResourceTypes)
	},
	link: String,
	author: ObjectId, //User._id
	created: {type: Date, default: Date.now},
	tags: [{type: ObjectId, index: true}],
	comments: [{
		body: String,
		author: ObjectId, //User._id
		created: {type: Date, default: Date.now},
	}],
	meta: {
		avgScore: Number,
		ratings: [Number],
		favs: Number
	},
});
Object.assign(resourceSchema.statics, { ResourceTypes });

const userSchema = new Schema({
	email: {type: String, index: true, unique: true},
	username: {type: String, index: true, unique: true},
	hash: String,
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

//Register our schema as models
var Tag = mongoose.model("Tag", tagSchema);
var Resource = mongoose.model("Resource", resourceSchema);
var User = mongoose.model("User", userSchema);

module.exports = {
	Tag, Resource, User
};