// mobvd Nicolas Vallotton 2017-2018
// Creating APP object for storing all Methods
APP = {};
// // Declaring global variables
// Storing size of the browser viewport
let windowHeight = $(window).height();  // returns height of browser viewport
let windowWidth = $(window).width();  // returns width of browser viewport
// Map
let map;

let check = true;

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

let colorsRRS;
let colorRS;
let pixels = [];

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
// var to know if json are loaded or not
let pixLoaded = 0;
let stopsLoaded = 0;
// Initializing the whole script of the page
APP.main = function(stops){
  APP.initMap();
  d3.queue()
    // .defer(APP.loadDataOtp)
    // .defer(APP.loadDataPsql)
    // .defer(APP.loadPixels)
    // .defer(APP.loadStops)
    // .await(function(error,stops) {
    //   if (error) throw error;
    //   console.log("AWAIT");
    //   APP.stopsTooltip(stops);
    // });
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
      if(check == true){
        var coord = e.latlng;
        lat = coord.lat;
        lng = coord.lng;
        urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
        APP.loadDataOtp(urlOtp);
      } else {
        d3.selectAll('.pix').on('click', function(d){
          urlPsql= `sa_tp${d.properties.rastid}`;
          console.log(urlPsql);
          console.log("1");
          APP.loadDataPsql(urlPsql); // changer pour changeColor
          // get the right pixel
        });
      }
    });
    // Getting tooltip ready for showing data
    tooltipMap = d3.select('#map')
    .append('div')
    .attr('class', 'tooltip');
    // Switch button to change mode vector/raster
    $('#switch-button').on('click', function(){
      if(check == true){
        console.log(check);
        APP.removeIso();
        APP.loadDataPsql(urlPsql);
        check = false;
      } else {
        console.log(check);
        APP.removeRast();
        APP.loadDataOtp(urlOtp)
        check = true;
      }
    });
    // change mode of the isochrone
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
      // ATTENTION le controleur efface les elements en fonction de l'id donc aléatoire
      snapIso[ct] = dataOverlay;
      console.log(snapIso[ct]);
      LC.addOverlay(snapIso[ct], "Iso"+ct);
    });
    APP.loadDataOtp(urlOtp);
};
APP.changeColor = function (dataArrayS, pixels){
  APP.dataJoin(dataArrayS, pixels)
  d3.selectAll(".pix")
    .transition()
    .duration(200)
    .attr('fill', function(d){
     let value = d.properties.time;
     if (value) {
       return colorRS(value);
       } else {
         return "#ccc";
       }
    })
};
// function to remove vector isochrones
APP.removeIso = function(){
  d3.select(".isochrone").remove();
};
// function to remove raster isochrones
APP.removeRast = function(){
  console.log("remove raster");
  d3.select(".pix").remove();
  // stopsLoaded = 0;
  // pixLoaded = 0;
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

// DECOMPOSER LA FOCNTION LOADPSQL!!!! LE 3 NEST CHARGE QUA LA FIN AU CHANGECOLOR
// function to load the datas of psql server
APP.loadDataPsql = function(){
  console.log("2");
    // empty array to push new datas
    dataArrayS = [];
    dataScaleS = [];
    console.log(dataArrayS);
    d3.json(urlPsql, function(error, data) {
      if(error) {
        console.log(error);
      }
      dataS = data;
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
      APP.choose();
      console.log("3");
      console.log(dataArrayS[1]);
    });
}
    // APP.dataJoin(dataArrayS, pixels);
APP.choose = function(){
  if(urlPsql.indexOf("sa")) {
    console.log(urlPsql);
    if(stopsLoaded==1){
      console.log(stopsLoaded);
      APP.changeColor(dataArrayS, pixels);
    } else {
      APP.loadStops(dataArrayS);
    }
  } else {
    if(pixLoaded==1){
      console.log("4");
      console.log(pixels, "pixels");
      APP.changeColor(dataArrayS, pixels);
    } else{
      console.log("pixels loaded",pixLoaded);
      APP.loadPixels(dataArrayS);
    }
  }
}

// function to load the datas
APP.loadStops = function(dataArrayS){
  APP.removeRast();
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
    stopsLoaded = 1;
 };
 APP.dataJoin = function(dataArrayS, pixels){
   // Retrieve the id of the data and link it to the geospatial geoid
   //For each pixel get the ID and assign the data value (if there is a corresponding one)
  for (let j=0; j < pixels.length; j++) {
     pixels[j].properties.time = 0;
     let jsonId = pixels[j].properties.rastid;
     for (let i = 0; i < dataArrayS.length; i++) {
      //Grab the pixel ID
      let dataId = dataArrayS[i].id;
       if (dataId == jsonId) {
         pixels[j].properties.time = dataArrayS[i].time;
         break;
       }
     }
   }
 };
 APP.colorize = function(){
   //Define the color domain according to the data
   // reverse the colors because of superimpose
   colorsRRS = colors.slice().reverse();
   min = d3.min(dataScaleS);
   max = d3.max(dataScaleS);
   console.log(min,max);
   colorRS = d3.scale.threshold()
                       .domain([min,max])
                       // .domain([0, 601, 1201, 1801, 2401, 3001, 3601])
                       .range(colorsRRS);
 };
 // function to load the datas
 APP.loadPixels = function(dataArrayS){
     d3.json("pix", function(error, data) {
       if(error) {
         console.log(error);
       }
       pixLoaded = 1;
       console.log("pixels loaded",pixLoaded);
       pixels = data.features;
       APP.colorize();
       APP.dataJoin(dataArrayS, pixels);
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
                 return colorRS(value);
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
     pixLoaded = 1;
     console.log("pixels loaded",pixLoaded);
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
