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
    map = new L.map("map", {center: [46.51522, 6.62981], zoom: 9.5, minZoom: 7, maxZoom: 15, maxBounds: ([[45.8, 5.7],[47.5, 7.9]])});
    let cartodb = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    });

    // Add the cartodb layer to the map
    cartodb.addTo(map);
    };

APP.initSVG = function(){
    // get json
    let dataJson = [];
    var dataOverlay = L.d3SvgOverlay(function(sel, proj) {

  var upd = sel.selectAll('path').data(dataJson);
  upd.enter()
    .append('path')
    .attr('d', proj.pathFromGeojson)
    .attr('stroke', 'black')
    .attr('fill', function(){ return d3.hsl(Math.random() * 360, 0.9, 0.5) })
    .attr('fill-opacity', '0.5');
  upd.attr('stroke-width', 1 / proj.scale);
});

// button to switch data
L.control.layers({"Data": dataOverlay}).addTo(map);

d3.json("iso5.json", function(data) { dataJson = data.features; dataOverlay.addTo(map) });

};
