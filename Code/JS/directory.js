
var creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:9cc5e18e-6b32-4cb9-868e-1944b3249452'
});

myConfig = new AWS.Config({credentials: creds, region: 'eu-north-1'});
AWS.config.update(myConfig);


var dynamoDB = new AWS.DynamoDB();

function searchDB() {
   const searchTerm = document.getElementById("search-bar").value;
   console.log(searchTerm);

   var attributeValues = {};

   attributeValues[':serviceName'] = {'S': searchTerm};
   attributeValues[':serviceDescription'] = {'S': searchTerm};

   console.log(attributeValues);

   var params = {
    TableName: "trans-services",
    FilterExpression : "contains(#serviceName, :serviceName) or contains(#serviceDescription, :serviceDescription)",
    ExpressionAttributeNames: {"#serviceName": "name", "#serviceDescription": "description"},
    ExpressionAttributeValues: attributeValues
    }

   dynamoDB.scan(params,
    function (err, data){
      if (err) {
        console.log("Error", err);
      }
      else {
        document.getElementById("search-results").innerHTML = "Search Results: ";
        var table = data.Items;
        let i = 0;
        while (i < table.length) {
            var newDiv = document.createElement("div");
            newDiv.id = table[i].id.S;
            document.getElementById(table[i].id.S).innerHTML += table[i].name.S;
            i++;
        }
        
        console.log(data);
      }
    }
   );
}