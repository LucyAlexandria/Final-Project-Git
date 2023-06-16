
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

// initialise array of json objects from database
var servicesArray = [];


// centre map on Liverpool
function positionMap(map){
  //coordinates for Liverpool
  map.setCenter({lat:53.4084, lng:-2.9916});
  map.setZoom(12);
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

function addMarkersToMap(map) {
  var spiritLevelMarker = new H.map.Marker({lat:53.3990, lng:-2.9778});
  // map.addObject(spiritLevelMarker);
  var inTrustMarker = new H.map.Marker({lat:53.4719, lng:-3.0160});
  // map.addObject(inTrustMarker);

  spiritLevelMarker.setData('Spirit Level');
  inTrustMarker.setData('InTrust');

  var container = new H.map.Group({
    objects: [spiritLevelMarker, inTrustMarker]
  });

  container.addEventListener('tap', function (evt) {
    console.log(evt.target.getData());
  });
  map.addObject(container);

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

function addMarkersToMap(map) {
  var spiritLevelMarker = new H.map.Marker({lat:53.3991, lng:-2.9778});
  map.addObject(spiritLevelMarker);
}

// get one item from database and return to log
// test to check that get is working
// asynchronous function so await and promise can be used
// async function getOneItem(){
//   try {
//       var params = {
//           Key: {
//            id:  {
//             S: "123"
//            }
//           }, 
//           TableName: "trans-services"
//       };
//       var result = await dynamoDB.getItem(params).promise()
//       console.log(JSON.stringify(result))
//   } catch (error) {
//       console.error(error);
//   }
// }

function populateServicesArray(){
  var params = {TableName: "trans-services"};
  dynamoDB.scan(params, function (err, data){
    if (err) {
      console.log("Error", err);
    }
    else {
      console.log("Success", data);
    }
  });
}




window.onload = function () {
  positionMap(map);
  addMarkersToMap(map);
<<<<<<< HEAD
  populateServicesArray();
 // getOneItem()

=======
>>>>>>> bfafc15d1deb614b29e2c96ab743511a9ec63964
}

restrictMap(map);