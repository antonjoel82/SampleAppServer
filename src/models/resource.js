const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const {ResourceTypes} = require("./enum.js");

const ResourceSchema = new Schema({
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
Object.assign(ResourceSchema.statics, { ResourceTypes });

const Resource = mongoose.model("Resource", ResourceSchema);

module.exports = {
	ResourceSchema, Resource
};