(function() {

  var map;
  var currentIsochron;
  var isochronCache = {};
  var colors = [
     "#08519c",
     "#3182bd",
     "#6baed6",
     "#9ecae1",
     "#c6dbef",
     "#eff3ff"
  ];

  init();

  function init() {

    var center = [51.5, 0.0];
    var zoom = 12;

    map = L.map('map').setView(center, zoom);
    L.esri.basemapLayer("DarkGray").addTo(map);
    L.esri.basemapLayer("DarkGrayLabels").addTo(map);

    initMarkers();
    initLegend();

  }

  function initLegend() {

    var legend = document.createElement('div');
    legend.style.width = "150px";
    legend.style.zIndex = "1000";
    legend.style.position = "absolute";
    legend.style.textAlign = "center";
    legend.style.bottom = "50px";
    legend.style.left = "10px";

    var time = 5;
    colors.forEach(function(color){

      var symbol = document.createElement('div');
      var text = document.createElement('span');

      symbol.style.backgroundColor = color;
      symbol.style.width = "100%";
      symbol.style.height = "36px";
      symbol.style.fontSize = "28px";
      symbol.style.opacity = 0.8;

      text.innerHTML = time + " mins";
      text.style.opacity = 1;
      time += 5;

      symbol.appendChild(text);
      legend.appendChild(symbol);

    });

    document.getElementById("map").appendChild(legend);

  }

  function initMarkers() {

    var stations = "/data/london-tube.geojson";
    var markers = L.markerClusterGroup({
      maxClusterRadius : 40
    });

    corslite(stations, function(err, resp) {

      if (err) console.error(err);
      var geojson = JSON.parse(resp.response);
      var tflIcon = new L.icon({
         iconUrl: '/imgs/tfl-marker.png',
         iconSize: [25, 25]
      });

      var feature, coords, stationName;
      for (var i=0; i < geojson.features.length; i++) {
        feature = geojson.features[i];
        coords = feature.geometry.coordinates;
        stationName = feature.properties.Name;
        marker = L.marker([coords[1], coords[0]], {icon: tflIcon} );
        marker.bindPopup(stationName);
        marker.stationName = stationName;

        marker.on("click", showIsochron);
        markers.addLayer(marker);
      }

      map.addLayer(markers);

    }, false); // cross origin?

  }

  function showIsochron(event) {

    var name = event.target.stationName;
    if (currentIsochron) map.removeLayer(currentIsochron);
    var isochron = isochronCache[name];

    if (!isochron) {
      isochronGeojson = "/data/isochrons/" + name + ".geojson";
      corslite(isochronGeojson, function(err, resp) {

        if (err) console.error(err);
        var geojson = JSON.parse(resp.response);

        var geojsonLayer = L.geoJson(geojson, {

          style: function(feature) {
              switch (feature.properties.time) {
                  case 5:  return {color: colors[0] };
                  case 10: return {color: colors[1] };
                  case 15: return {color: colors[2] };
                  case 20: return {color: colors[3] };
                  case 25: return {color: colors[4] };
                  case 30: return {color: colors[5] };
              }
          }

        });
        isochronCache[name] = geojsonLayer; // Cache the result
        currentIsochron = geojsonLayer;
        geojsonLayer.addTo(map);

      });
    } else if (isochron){

      currentIsochron = isochron;
      isochron.addTo(map);

    }

  }



})();
