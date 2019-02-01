# Zesty.io Node API Wrapper

Quickly access Zesty.io's Instance, Accounts and Media Management APIs.

## Installation

This tutorial assumes you have npm and Node.js (8.9.4 or greater) installed, and have a `package.json` file for your project.

Install via npm:

```
npm install zestyio-api-wrapper
```

Include this line at the top of your JavaScript project file:

```javascript
const Zesty = require('zestyio-api-wrapper');
```

## Instantiation

You can get the Zesty.io token and instance ZUID for your instance from the Zesty.io manager: go to the "Editor" section, and click on the "External Editing" button to display the values for your Zesty.io instance.

```javascript
const token = 'PRIVATE_TOKEN_FROM_ZESTYIO' // Keep in env file not in code
const instanceZUID = '8-b0a6c2b192-xkgt38' // ZUID of the Zesty.io Cloud Content Instance on which to make requests

const zesty = new Zesty(instanceZUID, token)
```

You can optionally enable API request and error logging by setting one or both of the `logErrors` and `logResponses` flags:

```javascript
const zesty = new Zesty(
  instanceZUID,
  token,
  {
    logErrors: true,
    logResponses: true
  }
)
```

## Usage

### Views

The wrapper allows CRUD on Zesty.io view files. See documentation [here](https://instances-api.zesty.org/#efc2e79a-e392-4114-a722-c3b512e23833):

Getting views returns a JSON array of view objects:

```javascript
try {
  const res = await zesty.getViews()
} catch(err) {
  console.log(err)
}
```

Creating a view (snippet):

```javascript
const fileName = 'navigation-snippet'
const code = 'my view content'
const payload = {
  code: code,
  fileName: fileName
}

try {
  const res = await zesty.createView(payload)
} catch (err) {
  console.log(err)
}
```

Creating a view (endpoint):

```javascript
const fileName = '/special-endpoint.json'
const code = JSON.stringify({ foo: 'bar' })
const payload = {
  code: code,
  type: 'ajax-json',
  fileName: fileName
}

try {
  const res = await zesty.createView(payload)
} catch (err) {
  console.log(err)
}
```

Saving a view, returns a JSON object:

```javascript
const viewZUID = '11-dbe794-wx5ppr'
const code = 'my view content'
const payload = {
  code: code
}

try {
  const res = await zesty.saveView(viewZUID, payload)
} catch (err) {
  console.log(err)
}
```

### Scripts

CRUD on Zesty.io script files. See documentation [here](https://instances-api.zesty.org/#83f109ba-94a8-4647-8cb7-06f2bfe291a0).

Getting scripts returns a JSON array of view objects:

```javascript
try {
  const res = await zesty.getScripts()
} catch(err) {
  console.log(err)
}
```

Creating a script:

```javascript
const fileName = 'my-script.js'
const code = "alert('hello world');"
const payload = {
  code: code,
  fileName: fileName,
  type: 'text/javascript'
}

try {
  const res = await zesty.createScript(payload)
} catch (err) {
  console.log(err)
}
```

Saving a script, returns a JSON object:

```javascript
const scriptZUID = '10-3568a8-79ml1q'
const code = "alert('hello world');"
const payload = {
  code: code
}

try {
  const res = await zesty.saveScript(scriptZUID, payload)
} catch (err) {
  console.log(err)
}
```

### Head Tags

CRUD on `<head>` tags (for example meta tags, stylesheet `link` tags, `script` tags that go in the head area of an HTML document).  Allows setting of tags at a per item (refered to as Resource ZUID in the documentation) level.  See documentation [here](https://instances-api.zesty.org/#1eabcc23-03a1-4414-bba1-177228345c8e).

Get all head tags:

```javascript
try {
  const res = await zesty.getHeadTags()
} catch (err) {
  console.log(err)
}
```

Get a single head tag by ZUID:

```javascript
const headTagZUID = `21-...` // Head Tag ZUIDs begin with 21

try {
  const res = await zesty.getHeadTag(headTagZUID)
} catch (err) {
  console.log(err)
}
```

Create a head tag:

See the [documentation](https://instances-api.zesty.org/#1eabcc23-03a1-4414-bba1-177228345c8e) for the full range of options.

```javascript
const resourceZUID = '7-...' // A content item

try {
  // Create a script tag to load a script only when rendering the view for the
  // content item whose ZUID is in resourceZUID

  let res = await zesty.createHeadTag({
    type: 'script',
    attributes: {
      src: 'https://mydomain.com/libs/library.js'
    },
    resourceZUID: resourceZUID
  })  

  // Create a meta 'generator' tag added in the head only when rendering the
  // view for the content item whose ZUID is in resourceZUID

  res = await zesty.createHeadTag({
    type: 'meta',
    attributes: {
      generator: 'This is a test'
    },
    resourceZUID: resourceZUID
  })  

  // Create a 'link' tag to load a CSS file from a specified URL only when 
  // rendering the view for the content item whose ZUID is in resourceZUID.

  res = await zesty.createHeadTag({
    type: 'link',
    attributes: {
      rel: 'stylesheet',
      href: 'https://mydomain.com/css/mystylesheet.css'
    },
    resourceZUID: resourceZUID
  })
} catch (err) {
  console.log(err)
}
```

Update an existing head tag by ZUID:

See the [documentation](https://instances-api.zesty.org/#1eabcc23-03a1-4414-bba1-177228345c8e) for the full range of options.

```javascript
const headTagZUID = `21-...` // Head Tag ZUIDs begin with 21
const resourceZUID = '7-...' // A content item

// Update an existing head tag to be a script loaded from its URL only 
// when rendering the view for the content item whose ZUID is in resourceZUID.

try {
  const res = await zesty.saveHeadTag(
    headTagZuid,
    {
      type: 'script',
      attributes: {
        src: 'https://mydomain.com/libs/another-library.js'
      },
      resourceZUID: resourceZUID
    }
  )
} catch (err) {
  console.log(err)
}

```

Delete a single head tag by ZUID:

```javascript
const headTagZUID = `21-...` // Head Tag ZUIDs begin with 21

try {
  const res = await zesty.deleteHeadTag(headTagZUID)
} catch (err) {
  console.log(err)
}
```

### Audit Trail

Provides methods to retrieve and filter audit trail entries.  See documentation [here](https://instances-api.zesty.org/#026123c3-086e-42bd-9eda-86c2b5de33a2).

Get all audit trail entries:

```javascript
try {
  const res = await zesty.getAuditTrailEntries()
} catch (err) {
  console.log(err)
}
```

Get a specific audit trail entry by its ZUID:

```javascript
const auditZUID = '15-...' // Audit trail entry ZUIDs begin with 15

try {
  const res = await zesty.getAuditTrailEntries(auditZUID)
} catch (err) {
  console.log(err)
}
```

Get audit trail entries having specific properties:

```javascript
const filterProps = {
  // Object keys can be:
  // order
  // dir
  // start_date
  // end_date
  // limit
  // page
  // action
  // affectedZUID
  // userZUID
  // See documentation for examples.
}

try {
  res = await zesty.searchAuditTrailEntries({
      limit: 5,
      order: 'created',
      dir: 'desc'
  })
} catch(err) {
  console.log(err)
}
```

Examples for each filtering parameter can be found in the [API documentation](https://instances-api.zesty.org/#026123c3-086e-42bd-9eda-86c2b5de33a2).

## Media Management Calls

### Media Bins

Get all media bins:

```javascript
try {
  const binsResponse = await zesty.getMediaBins()
  const firstBin = binsResponse.data[0]
  const firstBinId = firstBin.id
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Bin',
  status: 'OK',
  code: 200,
  data:[ 
    { 
      id: '<Bin ZUID>',
      name: '<Bin Name>',
      created_at: '2018-07-09T21:50:27.000Z',
      deleted_at: null,
      default: true 
    },
    ...
  ] 
}
```       

Get media bin by ID:

```javascript
try {
  const binId = 'media bin ID'
  const binResponse = await zesty.getMediaBin(binId)
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Bin',
  status: 'OK',
  code: 200,
  data: [ 
    { 
      id: '<Bin ZUID>',
      name: '<Bin Name>',
      created_at: '2018-07-09T21:50:27.000Z',
      deleted_at: null
    } 
  ] 
}
```

Update media bin by ID:

(Allows for bin name to be updated).

```javascript
const binId = 'media bin ID'

try {
  const binUpdateResponse = await zesty.updateMediaBin(binId, {
    name: 'New Name'
  })
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Bin <Bin ZUID> updated',
  status: 'OK',
  code: 200,
  data: [ 
    { 
      id: '<Bin ZUID>', 
      name: 'New Name' 
    } 
  ] 
}
```

### Media Groups (Folders)

Get all media groups in a bin:

```javascript
const binId = 'media bin ID'

try {
  const binGroupsResponse = await zesty.getMediaGroups(binId)
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Folder',
  status: 'OK',
  code: 200,
  data: [ 
    { 
      id: '<Group ZUID>',
      bin_id: '<Bin ZUID>',
      group_id: '<Parent Group ZUID>',
      name: '<Group Name>' 
    },
    ...
  ] 
}
```

Get media group by ID:

```javascript
const groupId = 'media group ID'

try {
  const groupResponse = await zesty.getMediaGroup(groupId)
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'group',
  status: 'OK',
  code: 200,
  data: [ 
    { 
      id: '<Group ZUID>',
      bin_id: '<Bin ZUID>',
      group_id: '<Parent Group ZUID>',
      name: '<Group Name>',
      groups: [],
      files: [ 
        { 
          id: '<File ZUID>',
          bin_id: '<Bin ZUID>',
          group_id: '<Group ZUID>',
          filename: '<Filename>',
          title: '<File Display Name>',
          url: '<URL to file>',
          created_by: null,
          created_at: '2018-10-22T23:13:24.000Z',
          updated_at: '2018-10-22T23:13:40.000Z',
          deleted_at: null
        },
        ... 
      ] 
    } 
  ] 
}
```

Create media group:

```javascript
const binId = 'media bin ID'
const groupId = 'parent group ID - optional'
const name = 'new group name - optional defaults to new folder'

try {
  const createGroupResponse = await zesty.createMediaGroup({
    bin_id: binId,
    group_id: groupId,
    name: name
  })
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Created folder <Group Name>',
  status: 'OK',
  code: 201,
  data: [ 
    { 
      id: '<Group ZUID>',
      bin_id: '<Bin ZUID>',
      group_id: '<Parent Group ZUID>',
      name: '<Group Name>',
      type: 'group' 
    } 
  ] 
}
```

Update media group by ID:

```javascript
const groupId = 'group ID to update'
const parentGroupId = 'parent group ID - optional'
const name = 'new group name - optional'

try {
  const updateGroupResponse = await zesty.updateMediaGroup(
    groupId,
    {
      group_id: parentGroupId,
      name: name
    }
  )
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Updated group <Group Name>',
  status: 'OK',
  code: 200,
  data: [ 
    { 
      id: '<Group ZUID>',
      name: '<Group Name>',
      group_id: '<Parent Group ZUID>' 
     } 
  ] 
}
```

Delete media group by ID:

```javascript
const groupId = 'group ID to delete'

try {
  const deleteGroupResponse = await zesty.deleteMediaGroup(groupId)
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Deleted group <Group ZUID>',
  status: 'OK',
  code: 200 
}
```

### Media Files

Get all media files in a bin:

```javascript
const binId = 'media bin ID'

try {
  const binFilesResponse = await zesty.getMediaFiles(binId)
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Group',
  status: 'OK',
  code: 200,
  data: [ 
    { 
      id: '<File ZUID>',
      bin_id: '<Bin ZUID>',
      group_id: '<Group ZUID>',
      filename: '<File name>',
      title: '<File display name>',
      url: '<URL to file>',
      created_by: null,
      created_at: '2018-10-22T23:13:24.000Z',
      updated_at: '2018-10-22T23:13:40.000Z',
      deleted_at: null,
    },
    ...
  ] 
}
```

Get media file by ID:

```javascript
const fileId = 'media file ID'

try {
  const fileResponse = await zesty.getMediaFile(fileId)
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Files',
  status: 'OK',
  code: 200,
  data: [ 
    { 
      id: '<File ZUID>',
      bin_id: '<Bin ZUID>',
      group_id: '<Group ZUID>',
      filename: '<File name>',
      title: '<File display name>',
      url: '<URL to file>',
      created_by: null,
      created_at: '2018-10-22T23:13:24.000Z',
      updated_at: '2018-10-22T23:13:40.000Z',
      deleted_at: null
    } 
  ] 
}
```

Create (upload) media file:

```javascript
const fs = require('fs')
const fileName = 'test.jpg'
const stream = fs.createReadStream(`/path/to/${fileName}`)
const fileType = 'image/jpeg'
const title= = 'A Media Item'
const binId = 'media bin ID'
const groupId = 'media group ID, use bin ID for root folder in bin'

try {
  const createFileResponse = await zesty.createMediaFile(
    binId,
    groupId,
    fileName,
    title,
    fileType,
    stream
  )
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'File uploaded',
  status: 'Created',
  data: [ 
    { 
      id: '<File ZUID>',
      bin_id: '<Bin ZUID>',
      group_id: '<Group ZUID>',
      filename: '<File name>',
      title: '<File display name>',
      url: '<URL to file>',
      type: 'file' 
    } 
  ],
  code: 201 
}
```

Update media file by ID:

(Allows ability to change file name, display title, group that the file is in).

```javascript
const fileId = 'media file ID'
const newName = 'newname.jpg - optional'
const newTitle = 'New Title - optional'
const newGroup = 'new group ID - optional'

try {
  const updateFileResponse = await zesty.updateMediaFile(
    fileId,
    {
      filename: newName,
      title: newTitle,
      group_id: newGroup
    }
  )
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: 'Updated file <File Name>',
  status: 'OK',
  code: 200,
  data: [ 
    { 
      id: '<File ZUID>',
      group_id: '<Group ZUID>',
      title: '<File Display Title>',
      filename: '<File Name>',
      url: '<URL to file>' 
    } 
  ] 
}
```

Delete media file by ID:

```javascript
const fileId = 'media file ID'

try {
  const deleteFileResponse = await zesty.deleteMediaFile(fileId)
} catch (err) {
  console.log(err)
}
```

Abbreviated response format:

```javascript
{ 
  message: '1 files deleted and purging',
  status: 'OK',
  code: 200 
}
```