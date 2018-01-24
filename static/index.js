// mobvd Nicolas Vallotton 2017-2018
// Creating APP object for storing all Methods
APP = {};
// // Declaring global variables
// Storing size of the browser viewport
let windowHeight = $(window).height();  // returns height of browser viewport
let windowWidth = $(window).width();  // returns width of browser viewport
// Map
let map;

let snapIso = [];

let dataOverlay;

let stops = [];
// Tooltip of the map
let tooltipMap;
//Color scale of the map
let color = [];
// Array to stock the infos from from the json
let dataArray = [];
// Array of all json datas
let dataJson = [];
// Array of all time datas
let dataScale = [];
// Array of all json datas
let dataSort = [];
//Color scale of the map
let colorScaleRange = [];
// get the color from colorbrewer lib
let colors;
let colorsR;
let min;
let max;
let ct = 0;
// latitude and longitude from Lausanne station
let lat = 46.516631;
let lng = 6.629156;
// ischrones cut off in secondes
let isoVal = [600, 1200, 1800, 2400, 3000, 3600]
let valCf = 1800;
let cf = "&cutoffSec="
let cf1 = cf+ "1800";
var mode = "TRANSIT,WALK";
var time = "07:30";
let baseUrl = "http://localhost:8080/otp/routers/default/isochrone?&fromPlace="
// get data url from the otp server
let url = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;

// Initializing the whole script of the page
APP.main = function(){
    APP.loadData();
    APP.loadStops();
    APP.changeUrl();
    APP.initMap();

};
// Work in progress
APP.changeUrl= function(){
}

// Initializing map - leaflet with cartodb basemap
APP.initMap = function(){
    // Initiaize the map
    map = new L.map("map", {center: [46.51522, 6.62981], zoom: 9.5, minZoom: 6, maxZoom: 15, maxBounds: ([[45.8, 5.7],[47.5, 7.9]])});
    let cartodb = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    });
    // Add the cartodb layer to map
    cartodb.addTo(map);
    // change the baseLayer
    let baseLayers = {
      "CartoDB": cartodb
      // here to add more layers
    };

    LC = L.control.layers(baseLayers)
    LC.addTo(map);
    // add scale to map
    L.control.scale({imperial: false}).addTo(map);
    // on click change the datas
    map.on('click', function(e){
      var coord = e.latlng;
      lat = coord.lat;
      lng = coord.lng;
      url = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
      console.log(url);
      APP.loadData(url);
    });
    $('.transport-mode select').on('change', function(){
      mode = $('.transport-mode select').val();
      url = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
      console.log(url);
      APP.loadData(url);
    });
    $('.transport-time input').on('change', function(){
      time = $('.transport-time input').val();
      url = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
      console.log(url);
      APP.loadData(url);
    });
    $('.sliderIso').change(function(){
      valCf = $('#slider1').val();
      $('#slider1_val').text(valCf/60 + " min");
      cf1 = cf + valCf;
      url = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
      console.log(cf1);
      APP.loadData(url);
    });
    $('#snap').on('click', function(){
      ct++;
      console.log(ct);
      $(".isochrone").addClass('snapIso'+ct)
                     .removeClass('isochrone');
      //add it to a control
      // ATTENTION je crois que le controleur efface les elements en fonction de l'id donc aléatoire
      snapIso[ct] = dataOverlay;
      console.log(snapIso[ct]);
      LC.addOverlay(snapIso[ct], "Iso"+ct);
    });
};
// function to remove SVG
APP.removeIso = function(){
  d3.select(".isochrone").remove();
};
// function to initialize SVG
APP.initIso = function(dataJson){
  // sorting time datas
  dataSort = dataScale.sort(function(a, b) {
    return a - b;
  });
  // reverse the colors because of superimpose
  var colorsR = colors.slice().reverse();
  // min = d3.min(dataSort);
  // max = d3.max(dataSort);
  var color = d3.scale.threshold()
                      .domain([0, 601, 1201, 1801, 2401, 3001, 3601])
                      .range(colors);
  // function to project the json on the map
  dataOverlay = L.d3SvgOverlay(function(sel, proj) {
    APP.removeIso();
    upd = sel.selectAll('path').data(dataJson);

      // update the projection of the SVG
      upd.enter()
         .append('path')
         .attr('d', proj.pathFromGeojson)
         .attr('fill-opacity', '0.2')
         .attr('fill', function(d){return color(d.properties.time);})
         .classed("isochrone", true);
      upd.attr('stroke-width', 0.1 / proj.scale);// for updating the stroke when zooming
  });
  // load the data to project
  d3.json(dataJson, function(data) {
    dataOverlay.addTo(map)
   });
};
// function to load the datas
APP.loadData = function(){
    d3.json(url, function(error, data) {
      if(error) {
        console.log(error);
      }
    // d3.json("static/iso5.json", function(data) {
      APP.jsonToArray(data);
    });
}
// function to load the datas
APP.loadStops = function(){
    d3.json("stops", function(error, data) {
      if(error) {
        console.log(error);
      }
      stops = data.features;
      let stopsOverlay = L.d3SvgOverlay(function(sel, proj) {
      let upd = sel.selectAll('path')
                   .data(stops);
          // update the projection of the SVG
          upd.enter()
             .append('path')
             .attr('d', proj.pathFromGeojson)
             .attr('fill-opacity', '0.2')
             .attr('fill', function(d){ return "turquoise"})
          upd.attr('stroke-width', 0.1 / proj.scale); // for updating the stroke when zooming
      });
      LC.addOverlay(stopsOverlay, "Arrêts de transport");
      // load the data to project
      d3.json(stops, function(data) {
        console.log(stops);
      stopsOverlay.addTo(map)
      });
    });
 };
// function to store the data into arrays
APP.jsonToArray = function(data){
  dataJson = data.features;

  colors = colorbrewer.Spectral[7]; // need n+1 of the domain
  console.log(colors);
  // empty array to push new datas
  dataScale = [];
  for (let i=0; i < data.features.length; i++){
    dataScale.push(
      data.features[i].properties.time
    );
  }
  for (i = 0; i < data.features.length; i++){
    dataArray.push({
      id : data.features[i].id,
      time : data.features[i].properties.time
    });
  }
  APP.initIso(dataJson);
};
