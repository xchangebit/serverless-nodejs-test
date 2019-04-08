const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());


app.post('/', (req, res) => {
    const {
        body: {
            name,
            sdkId,
            accessKeySecret,
            accessKeyId,
            applicationId,
        },
    } = req;
});