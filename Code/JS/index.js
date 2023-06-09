
function positionMap(map){
  map.setCenter({lat:53.4084, lng:-2.9916});
  map.setZoom(12);
}

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

  //Debug code to visualize restriction
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
// esize listener to make sure that the map occupies the whole container
window.addEventListener('resize', () => map.getViewPort().resize());

// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);

window.onload = function () {
  positionMap(map);
  addMarkersToMap(map);
}

restrictMap(map);