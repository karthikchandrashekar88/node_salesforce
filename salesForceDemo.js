var express = require('express');
var jsforce = require('jsforce');
var app = express();
var fs = require('fs');
var configurationFile = configurationFile = './configuration.js';

var configuration = JSON.parse(
    fs.readFileSync(configurationFile)
);

var oauth2 = new jsforce.OAuth2({
  clientId : configuration.clientId,
  clientSecret : configuration.clientSecret,
  redirectUri : configuration.redirectUri
});

var conn = new jsforce.Connection({ oauth2 : oauth2 });

app.get('/', function (req, res) {
  res.send('Salesforce Demo !!!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.get('/oauth2/auth', function(req, res) {
  var url = oauth2.getAuthorizationUrl({ scope : 'api id web' })
  console.log('url is :'+url);
  res.redirect(url);
});

app.get('/test_uri', function(req, res) {
  console.log('test uri');
  var code = req.param('code');
  console.log('Authentication Code :',code);

  var code = req.param('code');
  conn.authorize(code, function(err, userInfo) {
    if (err) {
      return console.error(err);
    }
    else{
      console.log(conn.accessToken);
      console.log(conn.refreshToken);
      console.log(conn.instanceUrl);
      console.log("User ID: " + userInfo.id);
      console.log("Org ID: " + userInfo.organizationId);
      createCustomObject();
    }
  });
  res.end();
});

//create custom object
function createCustomObject(){
  console.log('creating custom object ...');
  var metadata = [{
    fullName: 'codeGeass__c',
    label: 'Lelouch',
    pluralLabel: 'Lelouch vi',
    description: 'guren',
    enableReports: true,
    nameField: [{
      fullName: 'knightmareFrame__c',
      type: 'Text',
      label: 'KnightFrame'
    }
  ],
    deploymentStatus: 'Deployed',
    sharingModel: 'ReadWrite'
  }];
  conn.metadata.create('CustomObject', metadata, function(err, results) {
    if (err) {
      console.log('error',err);
    }
    else{
      console.log('results :',results);
      customField();
    }
  });
}

//create custom field
function customField(){
  var metadata = [{
    fullName: 'codeGeass__c.lancelot__c',
    label: 'Lancelot',
    type: 'Text',
    length: 80
  }];
  conn.metadata.create('CustomField', metadata, function(err, results) {
    console.log('trying to create custom field');
    if (err) {
      console.error(err);
    }
    else{
      console.log('results after creating custom field :',results);
    }
  });
}
