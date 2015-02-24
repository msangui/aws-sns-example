# AWS SNS Example
A simple node app that communicates with SNS throught AWS SDK to register devices and send push notifications.

### Endpoints
##### Register device to SNS
 <br/> 
```javascript
POST http://localhost:3000/register
{
    token: "Android's RegID or iOS's token"
}
```
 <br/> 
##### Send push notification to all registered devices
 <br/> 
```javascript
POST http://localhost:3000/push/all
{
    message: "Simple text message"
}
```
<br />
##### Send push notification to specific device
 <br/> 
```javascript
POST http://localhost:3000/push
{
    message: "Simple text message",
    endpointArn: "Device's endpoint ARN"
}
```

### Installation
Modify properties.json with your Amazon credentials and PlatformApplication ARN

### Running
node app.js
