'use strict';

const express = require('express');
const sls = require('serverless-http');
const Yoti = require('yoti');
const uuid = require('uuid/v4');
const AWS = require('aws-sdk'); 
const S3 = new AWS.S3();
const app = express();
const { addProfile } = require('../database');

//AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.YOTI_TABLE;
let yoti = null;
const sdkId = process.env.SDK_ID;

const createYotiClient = async () => {
  if (yoti){
    return Promise.resolve(yoti);
  } 

  
  return S3.getObject({Bucket: process.env.BUCKET_NAME, Key: process.env.KEY_NAME}).promise()
    .then((pem) => {
      console.log(`instantiated x yoti client ${process.env.SDK_ID}`);
      
      yoti = new Yoti.Client(sdkId, Buffer.from(pem.Body.toString(),'utf8'));
      return yoti;
    });

};
const submitToken = async (token) => {
  const tokenId = uuid();
  if(!token) {
    return Promise.reject(null);
  }

  return createYotiClient()
    .then(() => {
      return yoti.getActivityDetails(token)
      .then(details => {
        console.log('activityDetails', activityDetails.profile);

        const {
          parsedResponse: {
              receipt,
          },
          decryptedProfile: attributes
      } = details  

        const {
          receipt_id,
          remember_me_id,
          policy_uri
        } = receipt;

        const receiptPromise = S3.putObject({
          Bucket: process.env.BUCKET_NAME,
          Key: `${remember_me_id}/${receipt_id}/receipt`,
          Body: receipt,
        })
        .promise();

        const attributesPromise = S3.putObject({
          Bucket: process.env.BUCKET_NAME,
          Key: `${remember_me_id}/${receipt_id}/attributes.json`,
          Body: JSON.stringify(attributes),
        })
        .promise();

        const policyURIPromise = S3.putObject({
          Bucket: process.env.BUCKET_NAME,
          Key: `${remember_me_id}/${receipt_id}/policy.uri`,
          Body: policy_uri
        })
        .promise();

        return Promise.all([addProfile(remember_me_id, policy_uri, receipt_id),
            receiptPromise,
            attributesPromise,
            policyURIPromise
          ]);
      })
    })
    .catch(e => console.log('error getting details', e.message, e.stack, token));

  
};

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.post('/register', async (req ,res) => {
  const register = require('./register');

  const key = await register();

  S3.putObject({
      Bucket: process.env.BUCKET_NAME,
      Key: process.env.KEY_NAME,
      Body: key.pem
    })
    .promise()
    .then(() => {
      res.status(200).send(key.public);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).send('unable to register');
    });
});

app.get('/callback', (req, res) => {
  const {
    query: {
      token = null,
    },
  } = req;
  
  submitToken(token)
    .then((result) => {
      console.log(result)
      const {
        Items: [item]
      } = result;
      res.status(200).json({
        idv_id: item.id,
        item,
      });
    })
    .catch((err = { message: 'unknown error'}) => {
      res.status(400).json({ token: null, error: err.message });
    })
});

module.exports.server = sls(app);
