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
//Color scale of the map
let color = [];
// Array to stock the infos from from the json
let dataArray = [];
// Array of all json datas
let dataJson = [];
// Array of all json datas
let dataScale = [];

let min;
let max;



//Color scale of the map
let colorScaleRange = [];

let colors = ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"];
/*****
Initializing the whole script of the page
*****/
APP.main = function(){
    APP.loadData();
    setTimeout(500);
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

    let dataTime = [];
    var dataOverlay = L.d3SvgOverlay(function(sel, proj) {

      var upd = sel.selectAll('path').data(dataJson);
          // console.log(dataJson);
          // console.log(dataJson.properties);
          console.log(dataScale);
          var color = d3.scale.threshold()
                        .domain([600, 900, 1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400, 6000])
                        .range(colors);
          upd.enter()
             .append('path')
             .attr('d', proj.pathFromGeojson)
             .attr('stroke', 'blue')
             .attr('fill-opacity', '0.2')
             .attr('fill', function(d){ return color(d.properties.time)})
          upd.attr('stroke-width', 0.1 / proj.scale);
      });

  // button to switch data
  L.control.layers({"Data": dataOverlay}).addTo(map);
    d3.json("iso5.json", function(data) {
      console.log(data);
      dataOverlay.addTo(map) });
};

APP.loadData = function(){
    d3.json("iso5.json", function(data) {
      console.log(data);
      APP.jsonToArray(data);
    });
}

// Storing the data into an array
APP.jsonToArray = function(data){
  dataJson = data.features;
  for (let i=0; i < data.features.length; i++){
    dataScale.push(
      data.features[i].properties.time
    );
  }
  var min = d3.min(dataScale);
  var max = d3.max(dataScale);
  // console.log(dataScale);
  for (i = 0; i < data.features.length; i++){
    dataArray.push({
      id : data.features[i].id,
      time : data.features[i].properties.time
    });
  }
};
