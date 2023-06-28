
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

function addMarkersToContainer(map, latitude, longitude, id) {
  var newMarker = new H.map.Marker({lat:latitude, lng:longitude});
  newMarker.setData(id);
  newMarker.setZIndex(2);
  //console.log(newMarker.getData());
  servicesContainer.addObject(newMarker);
}

function addMarkerContainerToMap(){
  map.addObject(servicesContainer);
}

servicesContainer.addEventListener('tap', function(event){
  selectedServiceID = event.target.getData();
  //console.log(selectedServiceID);

  currentServiceDisplayed = document.getElementById('service-id').innerHTML;
  //console.log(currentServiceDisplayed);

  if (selectedServiceID !== currentServiceDisplayed){
    params = {TableName: "trans-services", Key: {id: {S: selectedServiceID}}};
    dynamoDB.getItem(params, function(err, data){
      if(err){
        console.log("Error", err);
      }
      else {
        //console.log("retrieved ID: ", data.Item.id.S);
        document.getElementById('service-id').innerHTML = data.Item.id.S;
        document.getElementById('service-title').innerHTML = data.Item.name.S;
        //console.log(document.getElementById('service-id').innerHTML);
      }
    });
  }
  // else {
  //   console.log("repeat click");
  // }

});

function getServicesFromDatabase(){
  var params = {TableName: "trans-services"};
  dynamoDB.scan(params, 
    function (err, data){
      if (err) {
        console.log("Error", err);
      }
      else {
        console.log("Success", data);
        var table = data.Items;
        let i = 0
        while (i < table.length) {
          addMarkersToContainer(map, table[i].latitude.N, table[i].longitude.N, table[i].id.S);
          i++;
        }
        addMarkerContainerToMap();
      }
    }
  );
}

function checkService(){
  var attributeValues ={};
  var activeServices = [];


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
  var servicesFilter = "#typeValue IN (" + activeServices.join(', ') + ")";

  // console.log(attributeValues);
  // console.log(servicesFilter);

  if (activeServices.length == 0) {
    servicesContainer.removeAll();
  }
  else {
    var params = {
      TableName: "trans-services",
      FilterExpression : servicesFilter,
      ExpressionAttributeNames: {"#typeValue": "type"},
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
          let i = 0
          while (i < table.length) {
            addMarkersToContainer(map, table[i].latitude.N, table[i].longitude.N, table[i].id.S);
            i++;
          }
          // console.log("Success", data);
          addMarkerContainerToMap();
        }
      }
    );
  }
}

window.onload = function () {
  positionMap(map);
  getServicesFromDatabase();

}
restrictMap(map);