'use strict';

const express = require('express');
const sls = require('serverless-http');
const Yoti = require('yoti');
const uuid = require('uuid/v4');
const AWS = require('aws-sdk'); 
const S3 = new AWS.S3()
const app = express();

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

  const tokenData = {
    TableName: tableName,
    Item: {
      id: tokenId,
      token: token,
      created_at: Date.now()
    },
  };
  

  return createYotiClient()
    .then(() => {
      console.log(51)
      console.log(yoti)
      return yoti.getActivityDetails(token)
      .then(activityDetails => {
        console.log('activityDetails', activityDetails.profile);

        return dynamoDb.put(tokenData)
            .promise()
            .then(() => {
              return dynamoDb.query({
                TableName: tableName,
                KeyConditionExpression: 'id = :i',
                ExpressionAttributeValues: {
                  ':i': tokenId
                }
              }).promise();
            });
      })
    })
    .catch(e => console.log('error getting details', e.message, e.stack, token));

  
};

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
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
