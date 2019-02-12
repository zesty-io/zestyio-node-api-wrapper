const Zesty = require('zestyio-api-wrapper');
require('dotenv').config();

const token = process.env.ZESTY_TOKEN; // Keep in env file not in code
const instanceZUID = process.env.INSTANCE_ZUID; // ZUID of the Zesty.io Cloud Content Instance on which to make requests
 
const zesty = new Zesty(instanceZUID, token);

const newItem = {
    data: {
        field1: 'Hello Test 1',
        field2: 'Hello Test 2'
    },
    web: {
        canonicalTagMode: 1,
        metaLinkText: 'Hello Test 1',
        metaTitle: 'Meta Title Text',
        metaKeywords: 'meta,keyword,list',
        metaDescription: 'This is the meta description.'
    },
    meta: {
        contentModelZUID: '6-522a74-nhfdbd',
        createdByUserZUID: '5-5fd4c55-7ndknl'
    }
}

res = await zesty.createItem('6-522a74-nhfdbd', newItem);
console.log(util.inspect(res, false, null));