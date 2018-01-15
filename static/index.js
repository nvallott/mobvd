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

//Color scale of the map
let colorScaleRange = [];

let colors = colorbrewer.Spectral[11];
/*****
Initializing the whole script of the page
*****/
APP.main = function(){
    APP.loadData();
    APP.initMap();
    APP.initSVG();
};

/*****
Initializing map - leaflet with cartodb basemap
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

    var dataOverlay = L.d3SvgOverlay(function(sel, proj) {

      var upd = sel.selectAll('path').data(dataJson);
          console.log(dataScale);
          var color = d3.scale.threshold()
                        .domain(dataScale.reverse())
                        .range(colors);
          upd.enter()
             .append('path')
             .attr('d', proj.pathFromGeojson)
             .attr('fill-opacity', '0.2')
             .attr('fill', function(d){ return color(d.properties.time)})
             .on("mouseover", mover)
             .on("mouseout", mout);
          upd.attr('stroke-width', 0.1 / proj.scale); // for updating the stroke when zooming
      });

    //Mouseover function NOT WORKING
    function mover(d) {
      var el = d3.select(this)
    		.transition()
    		.duration(10)
    		.style("fill-opacity", 0.3);
    }

    //Mouseout function NOT WORKING
    function mout(d) {
    	var el = d3.select(this)
    	   .transition()
    	   .duration(1000)
    	   .style("fill-opacity", 1);
    };

  // button to switch data
  L.control.layers({"Data": dataOverlay}).addTo(map);

    // d3.json("iso5.json", function(data) {
    d3.json("static/iso5.json", function(data) {
      console.log(data);
      dataOverlay.addTo(map) });
};

APP.loadData = function(){
    // d3.json("iso5.json", function(data) {
    d3.json("static/iso5.json", function(data) {
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
