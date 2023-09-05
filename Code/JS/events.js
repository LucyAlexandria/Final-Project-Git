var creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:9cc5e18e-6b32-4cb9-868e-1944b3249452'
});

myConfig = new AWS.Config({credentials: creds, region: 'eu-north-1'});
AWS.config.update(myConfig);


var dynamoDB = new AWS.DynamoDB();



const event = {
    'summary': 'Google I/O 2015',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': '2015-05-28T09:00:00-07:00',
      'timeZone': 'America/Los_Angeles'
    },
    'end': {
      'dateTime': '2015-05-28T17:00:00-07:00',
      'timeZone': 'America/Los_Angeles'
    },
  };
  
  const request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });
  
  request.execute(function(event) {
    appendPre('Event created: ' + event.htmlLink);
  });