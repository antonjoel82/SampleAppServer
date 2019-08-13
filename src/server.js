/* Libraries */
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const mongoose = require("mongoose");

const {DEFAULT_PORT, SALT_FACTOR} = require("./constants.js");
const {User} = require("../src/models/user.js");

const app = express();

//Middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const activePort = process.env.PORT || DEFAULT_PORT;
app.listen(activePort, () => {
	console.log(`App is up and running on Port ${activePort}`);
});

const dburl = "mongodb://localhost:27017/restTest";

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

app.get("*", (req, res) => {
	return res.status(200).send({message: "Welcome to the back-end!"});
});

app.get("/", (req, res) => {
	res.json("Hitting Root Page.");
});

app.post("/register", (req, res) => {
	return registerNewUser(req, res);
});

app.post("/signin", async function(req, res) {
	return handleLogin(req, res);
});

async function handleLogin(req, res) {
	const {login, password} = req.body;
	const condition = {$or:[{email: login.toLowerCase()}, {username: login.toLowerCase()}]};

	const foundUser = await User.findOne(condition, (err, user) => {
		if (err || !user) {
			res.json(400).json("Failed...");
		}

		if (user.comparePassword(password)) {
			return user;
		} else {
			res.json(400).json("Passwords didn't match...");
		}
	});

	console.log(`USER: ${foundUser}`);
	res.json(foundUser);
};

	// app.post("/signin", async function(req, res) {
// 	let foundUser = null; 
// 	await retrieveUser(req, (err, user) => {
// 		return err ? null : user;
// 	}).then((user) => {
// 		foundUser = user;
// 	})

// 	if (!foundUser) {
// 		return res.status(400).json("Unable to sign-in the user with the supplied credentials.")
// 	}

// 	return updateLastLoginForUser(foundUser, (err, updatedUser) => {
// 		return updatedUser 
// 			? res.json(updatedUser) 
// 			: res.status(400).json("Unable to sign-in the user with the supplied credentials.");
// 	});
// });

function retrieveUser(req, done) {
	const {login, password} = req.body;

	return User.findOne(
		{$or:[
			{email: login.toLowerCase()}, 
			{username: login.toLowerCase()}
		]}, (err, user) => {
			if (err) {
				console.debug(`Unable to retrieve user with login: ${login} during initial retrieval.`);
				return done(err);
			}

			if (!user) {
				console.debug(`Unable to retrieve user with login: ${login}. User is null.`);
				return done(err);
			}

			user.comparePassword(password, (err, isMatch) => {
				if (err) {
					console.debug(`Unable to retrieve user with login: ${login} during hash comparison.`);
					return done(err);
				}
				if (!isMatch) {
					console.debug(`Unable to retrieve user with login: ${login} because password was incorrect.`);
					return done(err);
				}

				console.debug("Passwords matched! User retrieved: ", user);
				return done(null, user);
			});
		});
}

function updateLastLoginForUser(user, done) {
	if (!user) {
		console.debug("No user specified to update lastLogin time.")
		return done(new Error("No user specified to update lastLogin time."), user);
	}

	User.updateOne({_id: user._id}, {lastLogin: Date.now()}, (err, updatedUser) => {
		if (err) {
			console.debug("Could not update user's updated lastLogin time.")
			return done(err, user);
		}
		if (!updatedUser) {
			console.debug("Could not update user's updated lastLogin time.")
			return done(err, user);
		}
		return done(null, updatedUser);
	})
}

/**
 * Create a new user from the specified request.
 * @param {*} req 
 * @param {*} res 
 */
function registerNewUser(req, res) {
	const {email, username, password, name} = req.body;
	
	bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
		if (err) {
			return res.status(400).json(`Could not generate salt for new user. Reason: ${err.detail}`);
		}

		//Pass null as 3rd arg due to "progress" param being unused
		bcrypt.hash(password, salt, null, (err, hash) => {
			if (err) {
				return res.status(400).json(`Could not generate hash for new user. Reason: ${err.detail}`);
			}
			const userToSave = new User({ 
				email: email.toLowerCase(), 
				username: username.toLowerCase(),  
				hash, 
				name,
			});

			userToSave.save((err, user) => {
				if (err) {
					console.debug("Could not create user. ", err);
					return res.status(400).json(`Could not register new user. Reason: ${err.detail}`);
				}

				const respDebug = res.json(user);
				console.debug("Registered new user: ", user);
				console.log("Sending response for new user: ", respDebug);

				return respDebug;
			});
		});
	});
}