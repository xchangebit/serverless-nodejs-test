const RSA = require('node-rsa');
const AWS = require('aws-sdk'); 
const S3 = new AWS.S3();

module.exports = () => {
    const key = new RSA({ b: 512 });

    const pair = key.generateKeyPair();
    
    return {
        pem: pair.exportKey('pkcs1-pem'),
        public: pair.exportKey('pkcs1-public-pem'),
        private: pair.exportKey('pkcs1-private-pem'), 
    };
};

/*
return S3.getObject({Bucket: process.env.BUCKET_NAME, Key: process.env.KEY_NAME}).promise()
    .then((pem) => {
      console.log(`instantiated x yoti client ${process.env.SDK_ID}`);
      
      yoti = new Yoti.Client(sdkId, Buffer.from(pem.Body.toString(),'utf8'));
      return yoti;
    });
*/
exports.handler = () => {
    const key = generateKey();

    S3.putObject({
        Bucket: process.env.BUCKET_NAME,
        Key: process.env.KEY_NAME,
        Body: key.pem
    }).promise();
}

