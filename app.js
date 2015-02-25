var AWS = require('aws-sdk'),
  express = require('express'),
  bodyParser = require("body-parser"),
  app = express(),
  SNS;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/register', function (req, res) {
  var tokenToRegister = req.body.token;

  if (!tokenToRegister) {
    res.status(400).send({error: 'registration with SNS failed', message: 'token is required'});  
  } else {    
    SNS.createPlatformEndpoint({
      PlatformApplicationArn: SNSSettings.platformApplicationArn,
      Token: tokenToRegister
    }, function (snsError, snsResponse) {
      if (snsError) {
        res.status(500).send({error: 'registration with SNS failed', message: snsError});
      } else {
        res.status(200).send({message: 'registration with SNS succedded', endpointArn: snsResponse.EndpointArn});
      }
    });
  }
});

// all devices push
app.post('/push/all', function (req, res) {
  var message = req.body.message;

  if (!message) {
    res.status(500).send({error: 'push with SNS failed', message: 'message is required'});
  }

  getAllDevices(function (snsError, snsResponse) {
    if (snsError) {
      res.status(500).send({error: 'push with SNS failed', message: snsError}); 
    } else if (snsResponse.Endpoints.length === 0) {
      res.status(500).send({error: 'push with SNS failed', message: 'no device registered'});  
    } else {
      snsResponse.Endpoints.forEach(function (device) {      
        sendPushMessage(message, device.EndpointArn, function (snsError) {
          if (snsError) {
            res.status(500).send({error: 'push with SNS failed', message: snsError});
          } else {
            res.status(200).send({message: 'push with SNS succeded'});
          }
        });     
      });
    }
  });

});

// single device push
app.post('/push', function (req, res) {
  var message = req.body.message,
    endpointArn = req.body.endpointArn;

  if (!message || !endpointArn) {
    res.status(500).send({error: 'push with SNS failed', message: 'message and endpointArn is required'});
  }

  sendPushMessage(message, endpointArn, function (snsError) {
    if (snsError) {
      res.status(500).send({error: 'push with SNS failed', message: snsError});
    } else {
      res.status(200).send({message: 'push with SNS succeded'});
    }
  });     
});

// fetch devices' endpoints from amazon
function getAllDevices(callback) {
  SNS.listEndpointsByPlatformApplication({
    PlatformApplicationArn: SNSSettings.platformApplicationArn
  }, callback);
}

// util funciton which sends push messages to an specific Endpoint ARN
function sendPushMessage(message, endpointArn, callback) {
  SNS.publish({
    Message: JSON.stringify({
      GCM: JSON.stringify(
        {
          data: {
            message: message
          }
        }
      ),
      APNS_SANDBOX: JSON.stringify({
        aps: {
          alert: message,
          sound: 'default'
        }
      })
    }),
    MessageStructure: 'json',
    TargetArn: endpointArn
  }, callback);
}

// read properties
var SNSSettings = require('./properties.json');

SNS = new AWS.SNS(SNSSettings);

app.listen(3000);

