// mobvd Nicolas Vallotton 2017-2018
// Creating APP object for storing all Methods
APP = {};

/*****
Declaring global variables
*****/

// Storing size of the browser viewport
let windowHeight = $(window).height();  // returns height of browser viewport
let windowWidth = $(window).width();  // returns width of browser viewport


// Map
let map;
// Tooltip of the map
let tooltipMap;

/*****
Initializing the whole script of the page
*****/
APP.main = function(){
    console.log("main");
    APP.initMap();
    APP.initSVG();
};

/*****
Initializing map - leaflet with cartodb basemap and tooltip ready
*****/
APP.initMap = function(){
    // Initiaize the map - definig parameters and adding cartodb basemap
    map = new L.map("map", {center: [46.51522, 6.62981], zoom: 10, minZoom: 7, maxZoom: 15, maxBounds: ([[46.128688, 5.971754],[47.121474, 7.313116]])});
    let cartodb = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    });

    // Add the cartodb layer to the map
    cartodb.addTo(map);
    };

APP.initSVG = function(){
    // get json
    let svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

    d3.json("iso5.json", function(collection) {

      var transform = d3.geoTransform({point: projectPoint}),
          path = d3.geoPath().projection(transform);

     d3_features = g.selectAll("path")
        .data(collection.features)
        .enter().append("path");

      map.on("viewreset", reset);

      reset();

    function reset() {
          bounds = path.bounds(collection);

          var topLeft = bounds[0],
              bottomRight = bounds[1];

          svg .attr("width", bottomRight[0] - topLeft[0])
              .attr("height", bottomRight[1] - topLeft[1])
              .style("left", topLeft[0] + "px")
              .style("top", topLeft[1] + "px");

          g .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

          d3_features.attr("d", path).attr('fill','blue');
      }

     // Use Leaflet to implement a D3 geometric transformation.
      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }
  })
};
