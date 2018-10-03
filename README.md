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
const ZestyioAPIRequests = require('zestyio-node-api-wrapper');
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

Creating a view

```
let fileName = "navigation-snippet";
let content = "my view content";
let payload = {"code": content};
try {
	let res = await zestyioRequests.postView(fileName, payload);
} catch (err){
	console.log(err);
}

```

Saving a view, return a JSON object

```
let fileZUID = "11-dbe794-wx5ppr";
let content = "my view content";
let payload = {"code": content};
try {
	let res = await zestyioRequests.putView(fileZUID, payload);
} catch (err){
	console.log(err);
}

```
