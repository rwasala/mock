const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express();
app.use(bodyParser.json())
app.use(cors());
app.disable('etag');

const mockData = {};

const mockPort = getPortNumber(process.argv[2])
app.listen(mockPort, function () {
    log('Mock is running on port ' + mockPort)
});

app.post('/mock', function(req, res) {
    if (Array.isArray(req.body)) {
        req.body.forEach(function(request) {
            const method = request['method'];
            const path = request['path'];
            const status = request['status'];
            const latency = request['latency'];
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
                headers: request['headers'] || [],
                body: request['body']
            };    
        });   
        
        res.status(200).send({});  
    }

    res.status(400).send();
});

app.get('*', function (req, res) {
    sendResponse(req, res)
});

app.post('*', function (req, res) {
    sendResponse(req, res)
});

app.delete('*', function (req, res) {
    sendResponse(req, res)
});

app.put('*', function (req, res) {
    sendResponse(req, res)
});

app.patch('*', function (req, res) {
    sendResponse(req, res)
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

function sendResponse(req, res) {
    log(req.method + ' ' + req.url);
    const data = mockData[req.method+req.url];
    if (data) {
        addHeaders(res, data.headers);
        sleep(data.latency);
        res.status(data.status).send(data.body);
    }
    else {
        res.status(501).send("URL not mocked");
    }
}