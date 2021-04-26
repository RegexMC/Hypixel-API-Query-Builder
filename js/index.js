// TODO: Add required fields actually be required; save uuid
var prevElement;
var url = "";
var pars = {};
var debug = true; // Stops checking if the server is alive, helpful for when working only on the HTML

// List of (all?) hypixel api endpoints. Each endpoint has extra unused info for future features
const endpoints = [
	{
		path: "key",
		key_required: true,
		parameters: []
	},
	{
		path: "player",
		key_required: true,
		parameters: [
			{
				key: "uuid",
				type: "string",
				required: "true"
			}
		]
	},
	{
		path: "friends",
		key_required: true,
		parameters: [
			{
				key: "uuid",
				type: "string <uuid>",
				required: "true"
			}
		]
	},
	{
		path: "recentgames",
		key_required: true,
		parameters: [
			{
				key: "uuid",
				type: "string",
				required: "true"
			}
		]
	},
	{
		path: "status",
		key_required: true,
		parameters: [
			{
				key: "uuid",
				type: "string",
				required: "true"
			}
		]
	},
	{
		path: "guild",
		key_required: true,
		parameters: [
			{
				key: "id",
				type: "string <objectid>",
				required: "none"
			},
			{
				key: "player",
				type: "string <uuid>",
				required: "none"
			},
			{
				key: "name",
				type: "string",
				required: "none"
			}
		]
	},
	{
		path: "resources/achievements",
		key_required: false,
		parameters: []
	},
	{
		path: "resources/challenges",
		key_required: false,
		parameters: []
	},
	{
		path: "resources/quests",
		key_required: false,
		parameters: []
	},
	{
		path: "resources/guilds/achievements",
		key_required: false,
		parameters: []
	},
	{
		path: "resources/guilds/permissions",
		key_required: false,
		parameters: []
	},
	{
		path: "resources/skyblock/collections",
		key_required: false,
		parameters: []
	},
	{
		path: "resources/skyblock/skills",
		key_required: false,
		parameters: []
	},
	{
		path: "resources/skyblock/collections",
		key_required: false,
		parameters: []
	},

	{
		path: "skyblock/news",
		key_required: true,
		parameters: []
	},
	{
		path: "skyblock/auction",
		key_required: true,
		parameters: [
			{
				key: "uuid",
				type: "string",
				required: "none"
			},
			{
				key: "player",
				type: "string",
				required: "none"
			},
			{
				key: "profile",
				type: "string",
				required: "none"
			}
		]
	},
	{
		path: "skyblock/auctions",
		key_required: false,
		parameters: [
			{
				key: "page",
				type: "number [Default: 0]",
				required: "false"
			}
		]
	},
	{
		path: "skyblock/auctions_ended",
		key_required: false,
		parameters: []
	},
	{
		path: "skyblock/bazaar",
		key_required: false,
		parameters: []
	},
	{
		path: "skyblock/profile",
		key_required: true,
		parameters: [
			{
				key: "profile",
				type: "string <uuid>",
				required: "true"
			}
		]
	},
	{
		path: "skyblock/profiles",
		key_required: true,
		parameters: [
			{
				key: "uuid",
				type: "string <uuid>",
				required: "true"
			}
		]
	},
	{
		path: "boosters",
		key_required: true,
		parameters: []
	},
	{
		path: "counts",
		key_required: true,
		parameters: []
	},
	{
		path: "leaderboards",
		key_required: true,
		parameters: []
	},
	{
		path: "punishmentstats",
		key_required: true,
		parameters: []
	}
];

// When the doc loads check if the NodeJS server is alive
document.addEventListener("DOMContentLoaded", (event) => {
	if (!debug) {
		fetch("http://localhost:53354/status/")
			.then((result) => {
				// Server Alive
			})
			.catch((err) => {
				document.body.innerHTML = "<h1> Please start server (instructions on GitHub) </h1>";
			});
	}
	fetch("http://localhost:53354/config/get")
		.then((result) => result.json())
		.then((result) => {
			document.getElementById("apiKey").value = result.key;
		});
});

document.getElementById("endpoint-buttons").addEventListener("click", (event) => {
	if (event.target.id.toLowerCase() === "endpoint-buttons") return; // Check if clicking emptyness
	// Reset style of previously clicked button
	if (prevElement) {
		if (prevElement.id == event.target.id) return; // Button already selected, don't do anything
		prevElement.classList.remove("btn-secondary");
		prevElement.classList.add("btn-outline-secondary");
	}
	// Update the prevElement to currently clicked one.
	prevElement = event.target;

	// Add styling to clicked button
	event.target.classList.add("btn-secondary");
	event.target.classList.remove("btn-outline-secondary");

	// Get endpoint of button clicked
	const path = event.target.id.substr(event.target.id.indexOf("-") + 1);
	const endpoint = endpoints.find((endpoint) => endpoint.path == path);

	var parametersDiv = document.getElementById("parameters");
	parametersDiv.innerHTML = "<hr>";

	// If no endpoint found for the button (shouldn't happen) return and hide the parameters input
	if (endpoint == null) return (parametersDiv.style.visibility = "hidden");

	// Set url to the correct endpoint with key
	url = `https://api.hypixel.net/${endpoint.path}?key=${document.getElementById("apiKey").value}`;

	// Update the resulting query with the key hidden
	document.getElementById("resultURL").value = url.replace(/\?key=(.+)/, "?key=***");

	const parameters = endpoint.parameters;

	// Check if the endpoint doesnt have any parameters, then return if so.
	if (parameters == null || parameters.length == 0) {
		copyAs();
		return (parametersDiv.style.visibility = "hidden");
	}

	pars = {};
	parameters.forEach((parameter) => {
		// Create parent div for the parameters inputs
		var div = document.createElement("div");
		div.classList.add("mb-3");

		// Create label to define what parameter the textbox is for, along with if it's required
		var label = document.createElement("label");
		label.classList.add("form-label");
		label.setAttribute("for", parameter.key + "-in");
		label.innerHTML = `${parameter.key}:${parameter.type}${parameter.required === "true" ? "*" : ""}`;

		// Create textbox for input
		var input = document.createElement("input");
		input.classList.add("form-control");
		input.setAttribute("type", "text");
		input.id = parameter.key + "-n";

		// Can't remember what this is for lol
		pars[parameter.key] = "";

		// Listen for any input on this parameter, and update the output query
		input.addEventListener("input", (e) => {
			pars[parameter.key] = e.target.value;
			url = `https://api.hypixel.net/${endpoint.path}?key=${document.getElementById("apiKey").value}`;

			Object.keys(pars).forEach((key) => {
				if (pars[key] != "") {
					url += `&${key}=${pars[key]}`;
				}
			});

			document.getElementById("resultURL").value = url.replace(/\?key=[^&]+/, "?key=***");
			copyAs();
		});

		// Append the label and input to the parent div
		div.appendChild(label);
		div.appendChild(input);
		parametersDiv.appendChild(div);
	});

	parametersDiv.style.visibility = "visible";
	copyAs();
});

document.getElementById("apiKey").addEventListener("input", (event) => {
	url = url.replace(/\?key=[^&]+/, `?key=${document.getElementById("apiKey").value}`);
	document.getElementById("resultURL").value = url.replace(/\?key=[^&]+/, "?key=***");
});

document.getElementById("saveButton").addEventListener("click", (event) => {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://localhost:53354/config/set", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(
		JSON.stringify({
			key: document.getElementById("apiKey").value
		})
	);
});

document.getElementById("username-button").addEventListener("click", (event) => {
	event.target.disabled = true;
	fetch(`http://localhost:53354/username/${document.getElementById("username").value}`)
		.then((result) => result.text())
		.then((result) => {
			document.getElementById("uuid").value = result;
			event.target.disabled = false;
		})
		.catch((err) => {
			console.log(err);
			event.target.disabled = false;
		});
});

document.getElementById("username").addEventListener("keyup", function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		document.getElementById("username-button").click();
	}
});

document.getElementById("copyUUID").addEventListener("click", (event) => {
	document.getElementById("uuid").select();
	document.execCommand("copy");
});

document.getElementById("runButton").addEventListener("click", (event) => {
	event.target.disabled = true;
	var jsonViewer = new JSONViewer();
	var view = document.getElementById("view");
	var output = document.getElementById("output");
	fetch("http://localhost:53354/query/?" + url.substring("https://api.hypixel.net/".length))
		.then((result) => result.json())
		.then((result) => {
			event.target.disabled = false;
			output.value = JSON.stringify(result);
			view.innerHTML = "";
			view.appendChild(jsonViewer.getContainer());
			jsonViewer.showJSON(result);
		})
		.catch((err) => {
			event.target.disabled = false;
			output.value = JSON.stringify(err);
			view.innerHTML = "";
			view.appendChild(jsonViewer.getContainer());
			jsonViewer.showJSON(err);
		});
});

document.getElementById("copyAs").addEventListener("click", (event) => {
	document.getElementById("copyAsResponse").select();
	document.execCommand("copy");
});

document.getElementById("options").addEventListener("change", () => {
	copyAs();
});

document.getElementById("output").addEventListener("click", (event) => {
	event.target.select();
});

function copyAs() {
	const options = document.getElementById("options");
	const selected = options.value;
	if (selected == "javascript_fetch") {
		var query = `fetch("${url.replace(/\?key=[^&]+/, "?key=***")}")
			.then((response) => response.json())
			.then((response) => console.log(JSON.stringify(response)))
			.catch((err) => console.log(err));`;
		document.getElementById("copyAsResponse").value = query;
	} else if (selected == "javascript_axios") {
		var params = pars;
		params["key"] = "***";
		var query = `axios.get("${url.split("?")[0]}", {
			params: ${JSON.stringify(params)}	
			}).then((response) => {
				const data = response.data;
				console.log(JSON.stringify(data));
			}).catch((err) => {
				console.log(err);
			});
			`;
		document.getElementById("copyAsResponse").value = query;
	}
}

/* https://github.com/LorDOniX/json-viewer */

var JSONViewer = (function (document) {
	var Object_prototype_toString = {}.toString;
	var DatePrototypeAsString = Object_prototype_toString.call(new Date());

	/** @constructor */
	function JSONViewer() {
		this._dom_container = document.createElement("pre");
		this._dom_container.classList.add("json-viewer");
	}

	/**
	 * Visualise JSON object.
	 *
	 * @param {Object|Array} json Input value
	 * @param {Number} [inputMaxLvl] Process only to max level, where 0..n, -1 unlimited
	 * @param {Number} [inputColAt] Collapse at level, where 0..n, -1 unlimited
	 */
	JSONViewer.prototype.showJSON = function (jsonValue, inputMaxLvl, inputColAt) {
		// Process only to maxLvl, where 0..n, -1 unlimited
		var maxLvl = typeof inputMaxLvl === "number" ? inputMaxLvl : -1; // max level
		// Collapse at level colAt, where 0..n, -1 unlimited
		var colAt = typeof inputColAt === "number" ? inputColAt : -1; // collapse at

		this._dom_container.innerHTML = "";
		walkJSONTree(this._dom_container, jsonValue, maxLvl, colAt, 0);
	};

	/**
	 * Get container with pre object - this container is used for visualise JSON data.
	 *
	 * @return {Element}
	 */
	JSONViewer.prototype.getContainer = function () {
		return this._dom_container;
	};

	/**
	 * Recursive walk for input value.
	 *
	 * @param {Element} outputParent is the Element that will contain the new DOM
	 * @param {Object|Array} value Input value
	 * @param {Number} maxLvl Process only to max level, where 0..n, -1 unlimited
	 * @param {Number} colAt Collapse at level, where 0..n, -1 unlimited
	 * @param {Number} lvl Current level
	 */
	function walkJSONTree(outputParent, value, maxLvl, colAt, lvl) {
		var isDate = Object_prototype_toString.call(value) === DatePrototypeAsString;
		var realValue = !isDate && typeof value === "object" && value !== null && "toJSON" in value ? value.toJSON() : value;
		if (typeof realValue === "object" && realValue !== null && !isDate) {
			var isMaxLvl = maxLvl >= 0 && lvl >= maxLvl;
			var isCollapse = colAt >= 0 && lvl >= colAt;

			var isArray = Array.isArray(realValue);
			var items = isArray ? realValue : Object.keys(realValue);

			if (lvl === 0) {
				// root level
				var rootCount = _createItemsCount(items.length);
				// hide/show
				var rootLink = _createLink(isArray ? "[" : "{");

				if (items.length) {
					rootLink.addEventListener("click", function () {
						if (isMaxLvl) return;

						rootLink.classList.toggle("collapsed");
						rootCount.classList.toggle("hide");

						// main list
						outputParent.querySelector("ul").classList.toggle("hide");
					});

					if (isCollapse) {
						rootLink.classList.add("collapsed");
						rootCount.classList.remove("hide");
					}
				} else {
					rootLink.classList.add("empty");
				}

				rootLink.appendChild(rootCount);
				outputParent.appendChild(rootLink); // output the rootLink
			}

			if (items.length && !isMaxLvl) {
				var len = items.length - 1;
				var ulList = document.createElement("ul");
				ulList.setAttribute("data-level", lvl);
				ulList.classList.add("type-" + (isArray ? "array" : "object"));

				items.forEach(function (key, ind) {
					var item = isArray ? key : value[key];
					var li = document.createElement("li");

					if (typeof item === "object") {
						// null && date
						if (!item || item instanceof Date) {
							li.appendChild(document.createTextNode(isArray ? "" : key + ": "));
							li.appendChild(createSimpleViewOf(item ? item : null, true));
						}
						// array & object
						else {
							var itemIsArray = Array.isArray(item);
							var itemLen = itemIsArray ? item.length : Object.keys(item).length;

							// empty
							if (!itemLen) {
								li.appendChild(document.createTextNode(key + ": " + (itemIsArray ? "[]" : "{}")));
							} else {
								// 1+ items
								var itemTitle = (typeof key === "string" ? key + ": " : "") + (itemIsArray ? "[" : "{");
								var itemLink = _createLink(itemTitle);
								var itemsCount = _createItemsCount(itemLen);

								// maxLvl - only text, no link
								if (maxLvl >= 0 && lvl + 1 >= maxLvl) {
									li.appendChild(document.createTextNode(itemTitle));
								} else {
									itemLink.appendChild(itemsCount);
									li.appendChild(itemLink);
								}

								walkJSONTree(li, item, maxLvl, colAt, lvl + 1);
								li.appendChild(document.createTextNode(itemIsArray ? "]" : "}"));

								var list = li.querySelector("ul");
								var itemLinkCb = function () {
									itemLink.classList.toggle("collapsed");
									itemsCount.classList.toggle("hide");
									list.classList.toggle("hide");
								};

								// hide/show
								itemLink.addEventListener("click", itemLinkCb);

								// collapse lower level
								if (colAt >= 0 && lvl + 1 >= colAt) {
									itemLinkCb();
								}
							}
						}
					}
					// simple values
					else {
						// object keys with key:
						if (!isArray) {
							li.appendChild(document.createTextNode(key + ": "));
						}

						// recursive
						walkJSONTree(li, item, maxLvl, colAt, lvl + 1);
					}

					// add comma to the end
					if (ind < len) {
						li.appendChild(document.createTextNode(","));
					}

					ulList.appendChild(li);
				}, this);

				outputParent.appendChild(ulList); // output ulList
			} else if (items.length && isMaxLvl) {
				var itemsCount = _createItemsCount(items.length);
				itemsCount.classList.remove("hide");

				outputParent.appendChild(itemsCount); // output itemsCount
			}

			if (lvl === 0) {
				// empty root
				if (!items.length) {
					var itemsCount = _createItemsCount(0);
					itemsCount.classList.remove("hide");

					outputParent.appendChild(itemsCount); // output itemsCount
				}

				// root cover
				outputParent.appendChild(document.createTextNode(isArray ? "]" : "}"));

				// collapse
				if (isCollapse) {
					outputParent.querySelector("ul").classList.add("hide");
				}
			}
		} else {
			// simple values
			outputParent.appendChild(createSimpleViewOf(value, isDate));
		}
	}

	/**
	 * Create simple value (no object|array).
	 *
	 * @param  {Number|String|null|undefined|Date} value Input value
	 * @return {Element}
	 */
	function createSimpleViewOf(value, isDate) {
		var spanEl = document.createElement("span");
		var type = typeof value;
		var asText = "" + value;

		if (type === "string") {
			asText = '"' + value + '"';
		} else if (value === null) {
			type = "null";
			//asText = "null";
		} else if (isDate) {
			type = "date";
			asText = value.toLocaleString();
		}

		spanEl.className = "type-" + type;
		spanEl.textContent = asText;

		return spanEl;
	}

	/**
	 * Create items count element.
	 *
	 * @param  {Number} count Items count
	 * @return {Element}
	 */
	function _createItemsCount(count) {
		var itemsCount = document.createElement("span");
		itemsCount.className = "items-ph hide";
		itemsCount.innerHTML = _getItemsTitle(count);

		return itemsCount;
	}

	/**
	 * Create clickable link.
	 *
	 * @param  {String} title Link title
	 * @return {Element}
	 */
	function _createLink(title) {
		var linkEl = document.createElement("a");
		linkEl.classList.add("list-link");
		linkEl.href = "javascript:void(0)";
		linkEl.innerHTML = title || "";

		return linkEl;
	}

	/**
	 * Get correct item|s title for count.
	 *
	 * @param  {Number} count Items count
	 * @return {String}
	 */
	function _getItemsTitle(count) {
		var itemsTxt = count > 1 || count === 0 ? "items" : "item";

		return count + " " + itemsTxt;
	}

	return JSONViewer;
})(document);
