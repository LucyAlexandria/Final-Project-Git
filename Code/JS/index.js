
var creds = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'eu-north-1:9cc5e18e-6b32-4cb9-868e-1944b3249452'
 });

myConfig = new AWS.Config({credentials: creds, region: 'eu-north-1'});
AWS.config.update(myConfig);


var dynamoDB = new AWS.DynamoDB();

//check config file
// AWS.config.getCredentials(function(err) {
//   if (err) console.log(err.stack);
//   // credentials not loaded
//   else {
//     console.log("Access key:", AWS.config.credentials.accessKeyId);
//   }
// });


// centre map on Liverpool
function positionMap(map){
  //coordinates for Liverpool
  map.setCenter({lat:53.4084, lng:-2.9916});
  map.setZoom(11);
}

//restrict boundaries of map
function restrictMap(map){

  var bounds = new H.geo.Rect(53.6043, -3.1977, 53.1952, -2.7408);

  map.getViewModel().addEventListener('sync', function() {
    var center = map.getCenter();

    if (!bounds.containsPoint(center)) {
      if (center.lat > bounds.getTop()) {
        center.lat = bounds.getTop();
      } else if (center.lat < bounds.getBottom()) {
        center.lat = bounds.getBottom();
      }
      if (center.lng < bounds.getLeft()) {
        center.lng = bounds.getLeft();
      } else if (center.lng > bounds.getRight()) {
        center.lng = bounds.getRight();
      }
      map.setCenter(center);
    }
  });

  // Debug code to visualize restriction
  // map.addObject(new H.map.Rect(bounds, {
  //   style: {
  //       fillColor: 'rgba(55, 85, 170, 0.1)',
  //       strokeColor: 'rgba(55, 85, 170, 0.6)',
  //       lineWidth: 8
  //     }
  //   }
  // ));
}

// initialize communication
var platform = new H.service.Platform({
  apikey: "i4NUqM5SCb47XqGCOMUBSCYGxvAxa2t9phD9GpJPYcM"
});
var defaultLayers = platform.createDefaultLayers();

// initialize a map
var map = new H.Map(document.getElementById('map-container'),
  defaultLayers.vector.normal.map,{
  center: {lat:50, lng:5},
  zoom: 4,
  pixelRatio: window.devicePixelRatio || 1
});
// resize listener to make sure that the map occupies the whole container
window.addEventListener('resize', () => map.getViewPort().resize());

// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);

var servicesContainer = new H.map.Group({services: []});

function addMarkersToContainer(map, latitude, longitude, id, type) {
  var svgMarkup = '<svg fill="${COLOR}" width="24" height="24" ' +
  'xmlns="http://www.w3.org/2000/svg">' +
  '<path d="m8.075 23.52c-6.811-9.878-8.075-10.891-8.075-14.52 0-4.971 ' +
  '4.029-9 9-9s9 4.029 9 9c0 3.629-1.264 4.64-8.075 ' +
  '14.516-.206.294-.543.484-.925.484s-.719-.19-.922-.48l-.002-.004z"/>' +
  '</svg>';
  // reference marker svg image code from https://www.svgviewer.dev/s/457745/map-marker

   var markerColour = 'black';
   if (type == 'peer-support') {
    markerColour = '#f92e42';
   }
   if (type == 'mental-health') {
    markerColour = '#1BB8F7';
   }
   if (type == 'sexual-health') {
    markerColour = '#F3A4CF';
   }
   if (type == 'hair-removal') {
    markerColour = '#4f9627';
   }
   if (type == 'gp-practices') {
    markerColour = '#fcf80b';
   }


  var markerIcon = new H.map.Icon(
    svgMarkup.replace('${COLOR}', markerColour)),
    newMarker = new H.map.Marker({lat: latitude, lng: longitude },
      {icon: markerIcon});

  // var mapIcon = new H.map.Icon(svgMarkup.replace('${COLOR}', markerColour).replace('${TEXT}', markerText)),
  //    newMarker = new H.map.Marker({lat:latitude, lng:longitude}, {icon: mapIcon});

  newMarker.setData(id);
  newMarker.setZIndex(2);
  servicesContainer.addObject(newMarker);
  
}

function addMarkerContainerToMap(){
  map.addObject(servicesContainer);
}

servicesContainer.addEventListener('tap', function(event){
  selectedServiceID = event.target.getData();
  currentServiceDisplayed = document.getElementById('service-id').innerHTML;

  if (!document.getElementById('info-menu').checked) {
    document.getElementById('info-menu').checked = true;
  };

  if (selectedServiceID !== currentServiceDisplayed){
    params = {TableName: "trans-services", Key: {id: {S: selectedServiceID}}};
    dynamoDB.getItem(params, function(err, data){
      if(err){
        console.log("Error", err);
      }
      else {
        document.getElementById('service-id').innerHTML = data.Item.id.S;
        document.getElementById('service-title').innerHTML = data.Item.name.S;
        document.getElementById('service-details').innerHTML = data.Item.description.S;
        if(data.Item.hasOwnProperty("phone")){
          document.getElementById('service-phone').innerHTML = "Phone no: " + data.Item.phone.S;
          document.getElementById('service-phone').style = "display:block";
          document.getElementById('service-phone-link').href = "tel: " + data.Item.phone.S;
        }
        else {
          document.getElementById('service-phone').style = "display:none";
        };
        if(data.Item.hasOwnProperty("website")){
          document.getElementById('service-website').innerHTML = "Website: " + data.Item.name.S;
          document.getElementById('service-website').style = "display:block";
          document.getElementById('service-website-link').href = data.Item.website.S;
        }
        else {
          document.getElementById('service-website').style = "display:none";
        };
        if(data.Item.hasOwnProperty("wiki")){
          document.getElementById('service-wiki').innerHTML ="Trans Liverpool Wiki: " + data.Item.name.S;
          document.getElementById('service-wiki').style = "display:block";
          document.getElementById('service-wiki-link').href = data.Item.wiki.S;
        }
        else {
          document.getElementById('service-wiki').style = "display:none";
        };
        if(data.Item.hasOwnProperty("email")){
          document.getElementById('service-email').innerHTML = "Email: " + data.Item.email.S;
          document.getElementById('service-email').style = "display:block";
          document.getElementById('service-email-link').href = "mailto: " + data.Item.wiki.S;
        }
        else {
          document.getElementById('service-email').style = "display:none";
        };
      }
    });
  }
});


function getServicesFromDatabase(){
  var params = {TableName: "trans-services"};
  dynamoDB.scan(params, 
    function (err, data){
      if (err) {
        console.log("Error", err);
      }
      else {
        // console.log("Success", data);
        var table = data.Items;
        let i = 0
        while (i < table.length) {
          addMarkersToContainer(map, table[i].latitude.N, table[i].longitude.N, table[i].id.S, table[i].type.S);
          i++;
        }
        addMarkerContainerToMap();
      }
    }
  );
}

function checkService(){
  var gender = document.querySelector('input[name="gender"]:checked').value;

     if (document.getElementById('info-menu').checked) {
       document.getElementById('info-menu').checked = false;
     };
  var attributeValues ={};
  var activeServices = [];
  var genderSelection = [];

  if (document.getElementById('peer-support').checked == true){
    attributeValues[':typeValue1'] = {"S": "peer-support"};
    activeServices.push(":typeValue1");
  }
  if (document.getElementById('mental-health').checked == true){
    attributeValues[':typeValue2'] = {"S": "mental-health"};
    activeServices.push(":typeValue2");
  }
  if (document.getElementById('sexual-health').checked == true){
    attributeValues[':typeValue3'] = {"S": "sexual-health"};
    activeServices.push(":typeValue3");
  }  
  if (document.getElementById('hair-removal').checked == true){
    attributeValues[':typeValue4'] = {"S": "hair-removal"};
    activeServices.push(":typeValue4");
  }
  if (document.getElementById('gp-practices').checked == true){
    attributeValues[':typeValue5'] = {"S": "gp-practices"};
    activeServices.push(":typeValue5");
  }

  if (gender == "femme") {
    attributeValues[':genderValue1'] = {"S": "femme"};
    genderSelection.push(":genderValue1");
    attributeValues[':genderValue3'] = {"S": "both"};
    genderSelection.push(":genderValue3");
  }
  if (gender == "masc") {
    attributeValues[':genderValue2'] = {"S": "masc"};
    genderSelection.push(":genderValue2");
    attributeValues[':genderValue3'] = {"S": "both"};
    genderSelection.push(":genderValue3");
  }
  if (gender == "both"){
    attributeValues[':genderValue1'] = {"S": "femme"};
    genderSelection.push(":genderValue1");
    attributeValues[':genderValue2'] = {"S": "masc"};
    genderSelection.push(":genderValue2");
    attributeValues[':genderValue3'] = {"S": "both"};
    genderSelection.push(":genderValue3");
  }

  var servicesFilter = "#typeValue IN (" + activeServices.join(', ') + ") AND #genderValue IN (" + genderSelection.join(', ') + ")";
  
    if (activeServices.length == 0) {
    servicesContainer.removeAll();
  }
  else {
    var params = {
      TableName: "trans-services",
      FilterExpression : servicesFilter,
      ExpressionAttributeNames: {"#typeValue": "type", "#genderValue": "gender"},
      ExpressionAttributeValues: attributeValues
      }

    dynamoDB.scan(params,
      function (err, data){
        if (err) {
          console.log("Error", err);
        }
        else {
          servicesContainer.removeAll();
          var table = data.Items;
          let i = 0;
          while (i < table.length) {
            addMarkersToContainer(map, table[i].latitude.N, table[i].longitude.N, table[i].id.S, table[i].type.S);
            i++;
          }
          //console.log("Success", data);
          addMarkerContainerToMap();
        }
      }
    );
  }
}

function femmemasc() {

}

window.onload = function () {
  positionMap(map);
  getServicesFromDatabase();

}
restrictMap(map);