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
    fullName: 'codeGeass__c.team__c',
    label: 'team',
    type: 'Text',
    length: 80
  },
  {
    fullName: 'codeGeass__c.knightmareCount__c',
    label: 'knightframeCount',
    type: 'Number',
    precision: 3,
    scale: 0
  },
  {
    fullName: 'codeGeass__c.gynamadeCount__c',
    label: 'gynamadeCount',
    type: 'Number',
    precision: 3,
    scale: 0
  }];
  conn.metadata.create('CustomField', metadata, function(err, results) {
    console.log('trying to create custom field');
    if (err) {
      console.error(err);
    }
    else{
      console.log('results after creating custom field :',results);
      //creating an entry
      conn.sobject("codeGeass__c").create([
        {
          Name : 'Jeremaiah'
        },
        {
          Name : 'Snizel'
        }
      ],
      function(err, rets) {
        if (err) { return console.error(err); }
        for (var i=0; i < rets.length; i++) {
          if (rets[i].success) {
            console.log("Created record id : " + rets[i].id);
            //start update records
            conn.sobject("codeGeass__c").update({
              Name : 'obj'+i,
              Id : rets[i].id,
              team : 'team:'+i,
              knightframeCount : i+50,
              gynamadeCount : i+60
            }, function(err, ret) {
              if (err || !ret.success) { return console.error(err, ret); }
                console.log('Updated Successfully : ' + ret.id);
            });
            //end update records
          }
        }
      });
      //end creating entry*/
    }
  });
}
