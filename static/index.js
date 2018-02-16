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
// Array to stock the infos from from the json
let dataArrayS = [];
// Array of all json datas
let dataJson = [];
// Array of all json datas
let dataS = [];
// Array of all time datas
let dataScale = [];
// Array of all json datas
let dataSort = [];
// Array of all time datas
let dataScaleS = [];
// Array of all json datas
let dataSortS = [];
//Color scale of the map
let colorScaleRange = [];

let colors = colorbrewer.Spectral[10]; // 7
// get the color from colorbrewer lib
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
let urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
// get data url from the otp server
let urlPsql = "sa_tp2069"
// Initializing the whole script of the page
APP.main = function(stops){
  APP.initMap();
  d3.queue()
    .defer(APP.loadDataOtp)
    .defer(APP.loadDataPsql)
    // .defer(APP.loadPixels)
    // .defer(APP.loadStops)
    .await(function(error,stops) {
      if (error) throw error;
      console.log("AWAIT");
      APP.stopsTooltip(stops);
    });
};

// Initializing map - leaflet with cartodb basemap
APP.initMap = function(){
    // Initiaize the map
    map = new L.map("map", {center: [46.51522, 6.62981], zoom: 9.5, minZoom: 6, maxZoom: 15, maxBounds: ([[45.8, 5.7],[47.5, 7.9]])});
    let cartodb = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
    });
    // Add the cartodb layer to map
    cartodb.addTo(map);
    // Add the mapbox as baselayer
    let mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/nvallott/cjcw1ex6i0zs92smn584yavkn/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibnZhbGxvdHQiLCJhIjoiY2pjdzFkM2diMWFrMzJxcW80eTdnNDhnNCJ9.O853joFyvgOZv7y9IJAnlA');
    let toner = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {attribution: 'Add some attributes here!'});
    // change the baseLayer
    let baseLayers = {
      "CartoDB": cartodb,
      "MapBox": mapbox,
      "Stamen Toner": toner
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
      urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
      APP.loadDataOtp(urlOtp);
    });
    // Getting tooltip ready for showing data
    tooltipMap = d3.select('#map')
    .append('div')
    .attr('class', 'tooltip');
    // changem mode of the isochrone
    $('.transport-mode select').on('change', function(){
      mode = $('.transport-mode select').val();
      urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
      APP.loadDataOtp(urlOtp);
    });
    // change time of the isochrone
    $('.transport-time input').on('change', function(){
      time = $('.transport-time input').val();
      urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
      APP.loadDataOtp(urlOtp);
    });
    // change cut off time of the isochrone
    $('.sliderIso').change(function(){
      valCf = $('#slider1').val();
      $('#slider1_val').text(valCf/60 + " min");
      cf1 = cf + valCf;
      urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
      APP.loadDataOtp(urlOtp);
    });
    // take a snap of the isochrone
    $('#snap').on('click', function(){
      ct++;
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
                      .range(colorsR);
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
         .style('position','relative')
         .attr('pointer-events','visible')
         .classed("isochrone", true);
      upd.attr('stroke-width', 0.1 / proj.scale);// for updating the stroke when zooming
  });
  // load the data to project
  d3.json(dataJson, function(data) {
    dataOverlay.addTo(map)
   });
};
// function to load the datas of OTP API
APP.loadDataOtp = function(){
    d3.json(urlOtp, function(error, data) {
      if(error) {
        console.log(error);
      }
    // d3.json("static/iso5.json", function(data) {
      APP.jsonToArray(data);
      APP.stopsTooltip(stops);
    });
}

// function to load the datas of OTP API
APP.loadDataPsql = function(){
    d3.json(urlPsql, function(error, data) {
      if(error) {
        console.log(error);
      }
      dataS = data;
      // empty array to push new datas
      dataScaleS = [];
      for (let i=0; i < data.length; i++){
        dataScaleS.push(
          data[i].time
        );
      }
      for (i = 0; i < data.length; i++){
        dataArrayS.push({
          id : data[i].dest,
          time : data[i].time
        });
      }
    });
    if(urlPsql.indexOf("sa")) {
      console.log(urlPsql);
      APP.loadStops(dataArrayS);
    } else {
      console.log(urlPsql);
      APP.loadPixels(dataArrayS);
    }
}
// function to load the datas
APP.loadStops = function(dataArrayS){
    d3.json("stops", function(error, data) {
      if(error) {
        console.log(error);
      }
      console.log(dataArrayS);
      console.log(data);
      //Retrieve the id of the data and link it to the geospatial geoid
      // for (let i = 0; i < data.length; i++) {
      //   //Grab the commune geoID
      //   let dataId = data[i].geoid;
      //   //For each entity in the geojson get the geoID and assign the data value (if there is a corresponding one)
      //   for (let j=0; j < geom.com.features.length; j++) {
      //     let jsonId = geom.com.features[j].properties.geoid;
      //     if (dataId == jsonId) {
      //       geom.com.features[j].properties.value = data[i].value;
      //       break;
      //     }
      //   }
      // }

      stops = data.features;
      let stopsOverlay = L.d3SvgOverlay(function(sel, proj) {
      let upd = sel.selectAll('path')
                   .data(stops);
          // update the projection of the SVG
          upd.enter()
             .append('path')
             .attr('d', proj.pathFromGeojson)
             .attr('fill-opacity', '0.2')
             .attr('fill', function(d){return "blue"})
             .attr('z-index', 1000)
             .classed("stops", true)
          upd.attr('stroke-width', 0.1 / proj.scale); // for updating the stroke when zooming
      });
      // Add in the layer control
      // LC.addOverlay(stopsOverlay, "Arrêts de TP");
      // load the data to project
      d3.json(stops, function(data) {
        console.log(stops);
      stopsOverlay.addTo(map)
      });
    });
    APP.stopsTooltip(stops);
 };
 // function to load the datas
 APP.loadPixels = function(dataArrayS){
     d3.json("pix", function(error, data) {
       if(error) {
         console.log(error);
       }
       pixels = data.features;
       console.log(dataArrayS);
       console.log(pixels);
       //Define the color domain according to the data
       // reverse the colors because of superimpose
       var colorsRS = colors.slice().reverse();
       // min = d3.min(dataSort);
       // max = d3.max(dataSort);
       var colorS = d3.scale.threshold()
                           .domain([0, 601, 1201, 1801, 2401, 3001, 3601])
                           .range(colorsRS);
       console.log(pixels.length);
       // Retrieve the id of the data and link it to the geospatial geoid
       for (let i = 0; i < dataArrayS.length; i++) {

         //Grab the pixel ID
         let dataId = dataArrayS[i].id;
         //For each pixel get the ID and assign the data value (if there is a corresponding one)
         for (let j=0; j < pixels.length; j++) {
           let jsonId = pixels[j].properties.rastid;
           if (dataId == jsonId) {
             pixels[j].properties.time = dataArrayS[i].time;
             break;
           }
         }
       }
       console.log(pixels);
       let pixelsOverlay = L.d3SvgOverlay(function(sel, proj) {
       let upd = sel.selectAll('path')
                    .data(pixels);
           // update the projection of the SVG
           upd.enter()
              .append('path')
              .attr('d', proj.pathFromGeojson)
              .attr('fill-opacity', '0.2')
              .attr('fill', function(d){
               let value = d.properties.time;
               if (value) {
                 return colorS(value);
                 } else {
                   return "#ccc";
                 }
              })
              .classed("pix", true)
              .attr("pointer-events","visible");
           upd.attr('stroke-width', 0.1 / proj.scale); // for updating the stroke when zooming
       });
       // Add in the layer control
       // LC.addOverlay(pixelsOverlay, "Pixels de populations");
       // load the data to project
       d3.json(pixels, function(data) {
       pixelsOverlay.addTo(map)
       });
     });
  };
// function to store the data into arrays
APP.jsonToArray = function(data){
  dataJson = data.features;
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

// Defining tooltip events
APP.stopsTooltip = function(stops){
  setTimeout(function(){
      d3.selectAll('.stops')
        .on('mouseover', function(stops) {
          d3.select(this)
          .transition()
          .duration(50)
          tooltipMap.html(function(){
            // console.log(stops.properties.stop_name);
            return `Arrêt: ${stops.properties.stop_name}`;
          })
          .transition()
          .duration(100)
          .style('opacity', 0.8)
          .style('left', `${d3.event.pageX}px`)
          .style('top', `${d3.event.pageY}px`);
        })
        .on('mouseout', function() {
          d3.select(this)
          .transition()
          .duration(150)
          tooltipMap.transition()
          .duration(150)
          .style("opacity", 0);
        });
  }, 500);
};
