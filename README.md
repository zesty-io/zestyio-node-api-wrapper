# Zesty.io Node API Wrapper

Quickly access zesty.io's instance and accounts API.

## Usage

This tutorial assumes you have NPM installed, and have a package.json file running in your project.

Install via NPM:

```
npm install --save git+https://github.com/zesty-io/zestyio-node-api-wrapper.git
```

Include this line at the top of your file

```
const ZestyioAPIRequests = require('zestyio-api-wrapper');
```

### Instantiating

```
let token = "PRIVATE_TOKEN_FROM_ZESTYIO"; // this should be loaded from an env file
let instanceZUID = "8-b0a6c2b192-xkgt38"; // ZUID of the Zesty.io Cloud Content Instance on which to make requests

const zestyioRequests = new ZestyioAPIRequests(instanceZUID, token);

```

## Making Calls

### Views
CRUD on Zesty.io view files. See documentation here:
https://instances-api.zesty.org/#efc2e79a-e392-4114-a722-c3b512e23833

Getting views returns JSON array of view object

```
try {
	let res = await zestyioRequests.getViews();
} catch(err) {
	console.log(err);
}
```

Creating a view (snippet)

```
let fileName = "navigation-snippet";
let code = "my view content";
let payload = {"code": code, "fileName": fileName};
try {
	let res = await zestyioRequests.createView(payload);
} catch (err){
	console.log(err);
}

```

Creating a view (endpoint)

```
let fileName = "/special-endpoint.json";
let code = JSON.stringify({"foo":"bar"});
let payload = {"code": code,"type":"ajax-json", "fileName": fileName};
try {
	let res = await zestyioRequests.createView(payload);
} catch (err){
	console.log(err);
}

```

Saving a view, returns a JSON object

```
let viewZUID = "11-dbe794-wx5ppr";
let code = "my view content";
let payload = {"code": code};
try {
	let res = await zestyioRequests.saveView(viewZUID, payload);
} catch (err){
	console.log(err);
}

```

### Scripts
CRUD on Zesty.io script files. See documentation here:
https://instances-api.zesty.org/#83f109ba-94a8-4647-8cb7-06f2bfe291a0

Getting scripts returns JSON array of view object

```
try {
	let res = await zestyioRequests.getScripts();
} catch(err) {
	console.log(err);
}
```

Creating a script

```
let fileName = "my-script.js";
let code = "alert('hello world');";
let payload = {"code": code, "fileName": fileName, "type": "text/javascript"};
try {
	let res = await zestyioRequests.createScript(payload);
} catch (err){
	console.log(err);
}

```

Saving a script, return a JSON object

```
let scriptZUID = "10-3568a8-79ml1q";
let code = "my script content";
let payload = {"code": code};
try {
	let res = await zestyioRequests.saveScript(scriptZUID, payload);
} catch (err){
	console.log(err);
}

```
