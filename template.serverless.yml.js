const fs = require('fs');
const env = 'local'
const region = 'eu-central-1'
const serviceName = 'templating'
const sdkId = '123'
const yamlFile = `
service: ${serviceName}_yoti_sls

provider:
  name: aws
  runtime: nodejs8.10
  stage: ${env}
  region: ${region}
  environment:
    BUCKET_NAME: ${serviceName}-yoti-sls-${env}
    YOTI_TABLE: ${serviceName}-yoti-sls-${env}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
      Resource: "*"
    - Effect: Allow
      Action:
        - s3:ListBucket
        - s3:GetObject
      Resource: "arn:aws:s3:::${serviceName}-yoti-sls-${env}/*"

functions:
  yoti:
    handler: app.server
    memorySize: 128
    environment:
      SDK_ID: ${sdkId}
      KEY_NAME: application.pem
    events:
      - http:
          path: /
          method: ANY
          cors: true
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
`;

fs.writeFileSync(`${__dirname}/templated.yml`, yamlFile);