
var creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:9cc5e18e-6b32-4cb9-868e-1944b3249452'
});

myConfig = new AWS.Config({credentials: creds, region: 'eu-north-1'});
AWS.config.update(myConfig);


var dynamoDB = new AWS.DynamoDB();

function searchDB() {
   const searchTerm = document.getElementById("search-bar").value;
  //  console.log(searchTerm);

   var attributeValues = {};

   attributeValues[':serviceName'] = {'S': searchTerm};
   attributeValues[':serviceDescription'] = {'S': searchTerm};

  //  console.log(attributeValues);

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
        const searchResults = document.getElementById("search-results")
        while (searchResults.firstChild) {
          searchResults.removeChild(searchResults.firstChild);
        }
        var table = data.Items;
        console.log(table);
        let i = 0;
        while (i < table.length) {
            const newDiv = document.createElement("div");
            newDiv.id = table[i].id.S;
            searchResults.appendChild(newDiv);
            document.getElementById(table[i].id.S).innerHTML += "<h2>" + table[i].name.S + "</h2>";
            if (table[i].hasOwnProperty("phone")) {
              newLink = document.createElement("a");
              newLink.id = "phone-link-" + table[i].id.S;
              newDiv.appendChild(newLink);
              document.getElementById("phone-link-"+ table[i].id.S).innerHTML += "Phone No: " + table[i].phone.S + "<br>";
              document.getElementById("phone-link-" + table[i].id.S).href = "tel: " + table[i].phone.S;
            }
            if (table[i].hasOwnProperty("email")) {
              newLink = document.createElement("a");
              newLink.id = "email-link-" + table[i].id.S;
              newDiv.appendChild(newLink);
              document.getElementById("email-link-" + table[i].id.S).innerHTML += "Email: " + table[i].email.S + "<br>";
              document.getElementById("email-link-" + table[i].id.S).href = "mailto: " + table[i].email.S;
            }
            if (table[i].hasOwnProperty("website")) {
              newLink = document.createElement("a");
              newLink.id = "web-link-" + table[i].id.S;
              newDiv.appendChild(newLink);
              document.getElementById("web-link-" + table[i].id.S).innerHTML += "Website: " + table[i].website.S + "<br>";
              document.getElementById("web-link-" + table[i].id.S).href = table[i].website.S;
            }
            if (table[i].hasOwnProperty("wiki")) {
              newLink = document.createElement("a");
              newLink.id = "wiki-link-" + table[i].id.S;
              newDiv.appendChild(newLink);
              document.getElementById("wiki-link-" + table[i].id.S).innerHTML += "Trans Liverpool Wiki: " + table[i].wiki.S + "<br>";
              document.getElementById("wiki-link-" + table[i].id.S).href = table[i].wiki.S;
            }
            document.getElementById(table[i].id.S).innerHTML += table[i].description.S + "<br>";
            i++;
        }
        
        console.log(data);
      }
    }
   );
}