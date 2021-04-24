const port = 53354;
const express = require("express");
const cors = require('cors');
const fetch = require("node-fetch").default;
const fs = require("fs");
const server = express();
server.use(express.json());
server.use(cors());

server.get("/config/get", (req, res) => {
	var config = fs.readFileSync("./config.json");
	res.send(config);
});

server.post("/config/set", (req, res) => {
	try {
		fs.writeFileSync("./config.json", JSON.stringify(req.body));
		res.send(req.body);
	} catch (e) {
		res.end();
	}
});

server.get("/query/", (req, res) => {
	const url = "https://api.hypixel.net/" + req.url.substring("/query/?".length);
	fetch(url)
		.then((result) => result.json())
		.then((result) => {
			res.send(result);
		})
		.catch((err) => {
			res.send(err);
		});
});

server.listen(port);
