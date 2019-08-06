/* Libraries */
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const mongoose = require("mongoose");

const {Tag, Resource, User} = require("./schema.js");

const app = express();

//Middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const ACTIVE_PORT = 3000;
app.listen(ACTIVE_PORT, () => {
	console.log(`App is up and running on Port ${ACTIVE_PORT}`);
});

const dburl = "mongodb://localhost:27017/test";

mongoose.connect(dburl, {useNewUrlParser: true})
	.then(() => {
		console.log("Successfully connected to MongoDB.");
	})
	.catch(err => {
		console.error(`Connecting to MongoDB failed: ${err}`);
	});

mongoose.connection.on("error", err => {
	console.error(`Lost connection to MongoDB: ${err}`);
});

app.get("/", (req, res) => {
	res.json("Hitting Root Page.");
});