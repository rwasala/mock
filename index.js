const express = require('express');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json())
const mockData = {};

const mockPort = getPortNumber(process.argv[2])
app.listen(mockPort, function () {
    log('Mock is running on port ' + mockPort)
});

app.get('*', function (req, res) {
    log('GET ' + req.url);
    const data = mockData['GET'+req.url];
    if (data) {
        addHeaders(res, data.headers);
        sleep(data.latency);
        res.status(data.status).send(data.body);
    }
    else {
        res.status(501).send("URL not mocked");
    }
});

app.post('/mock', function(req, res) {
    const method = req.body['method'];
    const path = req.body['path'];
    const status = req.body['status'];
    const latency = req.body['latency'];
    let statusForMock = 200;
    let latencyForMock = 0;

    if (status && Number.isInteger(Number(status)) && status > 99 && status < 600) {
        statusForMock = status;
    }
    
    if (latency && Number.isInteger(Number(latency)) && latency > 0) {
        latencyForMock = latency;
    }

    mockData[method+path] = {
        status: statusForMock,
        latency: latencyForMock,
        headers: req.body['headers'] || [],
        body: req.body['body']
    };

    res.status(200).send({});   
});

function sleep(timeInMs) {
    var waitTill = new Date(new Date().getTime() + timeInMs);
    while(waitTill > new Date()) {}
}

function getPortNumber(port) {
    if (port && Number.isInteger(Number(port)) && port > 0) {
        return port;
    }

    return 80;
}

function log(text) {
    console.log(text);
}

function addHeaders(res, headersArray) {
    if (Array.isArray(headersArray)) {
        headersArray.forEach(function(header) {
            res.set(header.key, header.value)
        });
    }
}