// mobvd Nicolas Vallotton 2017-2018
// Creating APP object for storing all Methods
APP = {};
// // Declaring global variables
// Storing size of the browser viewport
let windowHeight = $(window).height();  // returns height of browser viewport
let windowWidth = $(window).width();  // returns width of browser viewport
// Map
let map;
// to save the vector isochrone
let snapIso = [];
// d3 layer over the leaflet layer
let dataOverlay;
// data of the stops
let stops = [];
// Tooltip of the map (mouse over)
let tooltipMap;
// Array to stock infos from the database
let dataArray = [];
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
// var to stock population info datas
let dataSum = [];
// all the datas for the raster mode
let pixels = [];
//Color scale of the map
let color = [];
// colors used in the vector and raster mode from colorbewer lib
let colors = colorbrewer.Spectral[10];
// get the color from colorbrewer lib
let colorsR;
// d3 colors classification and the reverse version
let colorRS;
let colorsRRS;
let min;
let max;
// check vector or raster mode
let check = true;
// count number of snapshot
let ct = 0;
// latitude and longitude from Lausanne station
let lat = 46.516631;
let lng = 6.629156;
// ischrones cut off in secondes
let isoVal = [600, 1200, 1800, 2400, 3000, 3600];
let valCf = 1800;
let cf = "&cutoffSec=";
let cf1 = cf+ "1800";
var mode = "TRANSIT,WALK";
var time = "07:00";
let baseUrl = "http://localhost:8080/otp/routers/default/isochrone?&fromPlace=";
// get data url from the otp server
let urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
// get data url from the otp server
// let rastId = "2570";
let rastId = "18902";
let rastMode = "t";
let urlPsql = "sd_" + rastMode + rastId;
// var to know if json are loaded or not
let pixLoaded = 0;
let stopsLoaded = 0;
// Initializing the whole script of the page
APP.main = function(stops){
  APP.initMap();
  // d3.queue()
    // .defer(APP.loadDataOtp)
    // .defer(APP.loadDataPsql)
    // .defer(APP.loadPixels)
    // .defer(APP.loadStops)
    // .await(function(error,stops) {
    //   if (error) throw error;
    //   APP.stopsTooltip(stops);
    // });
};

// Initializing map - leaflet with cartodb basemap
APP.initMap = function(){
    // Initiaize the map
    map = new L.map("map", {center: [46.51522, 6.62981], zoom: 9.5, minZoom: 6, maxZoom: 17, maxBounds: ([[45.8, 5.7],[47.5, 7.9]])});
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

    LC = L.control.layers(baseLayers);
    LC.addTo(map);
    // add scale to map
    L.control.scale({imperial: false}).addTo(map);
    // on click change the datas
    map.on('click', function(e){
      if(check == true){
        let coord = e.latlng;
        lat = coord.lat;
        lng = coord.lng;
        urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
        APP.loadDataOtp(urlOtp);
      } else {
        d3.selectAll('.pix').on('click', function(d){
          rastId = d.properties.rastid;
          urlPsql= "sd_" + rastMode + rastId;
          console.log(urlPsql);
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
      mode = $('.transport-mode select').val();
      rastMode = mode.charAt(0).toLowerCase();
      console.log(mode,rastMode, "switch");
      if(check == true){
        APP.removeIso();
        APP.removeIsoDeco();
        APP.loadDataPsql(urlPsql);
        check = false;
      } else {
        urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
        APP.removeRast();
        APP.removeLegend();
        APP.loadDataOtp(urlOtp);
        $(".isoDeco").show();
        check = true;
      }
    });
    // change mode of the isochrone
    $('.transport-mode select').on('change', function(){
      mode = $('.transport-mode select').val();
      rastMode = mode.charAt(0).toLowerCase();
      console.log(rastMode);
      if(check == true){
        urlOtp = baseUrl + lat + "," + lng + "&date=2017/12/20&time=" + time + "&mode=" + mode + cf1;
        APP.loadDataOtp(urlOtp);
      } else {
      //   if (mode == "TRANSIT,WALK") {
      //     console.log("transit");
      //     rastMode = "t";
      //   } else if (mode == "CAR,WALK"){
      //     console.log("car");
      //     rastMode = "c";
      //   } else if (mode == "BICYCLE,WALK"){
      //     console.log("bike");
      //     rastMode = "b";
      //   }
          urlPsql = "sd_" + rastMode + rastId;
          APP.loadDataPsql(urlPsql);
        }
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
      LC.addOverlay(snapIso[ct], "Iso"+ct);
    });
    APP.loadDataOtp(urlOtp);
};
APP.changeColor = function (dataArrayS, pixels){
  APP.dataJoin(dataArrayS, pixels);
  d3.selectAll(".pix")
    .transition()
    .duration(400)
    .attr('fill', function(d){
     var value = d.properties.time;
     if (value) {
       d.properties.color = colorRS(value);
       return colorRS(value);
       } else {
         return "#ccc";
       }
    })
    .attr('class', function(d){
     var value = d.properties.time;
     if (value) {
       d.properties.color = colorRS(value);
       return "pix " + colorRS(value);
       } else {
         return "pix #ccc";
       }
    });
};
// function to remove vector isochrones
APP.removeIsoDeco = function(){
  $(".isoDeco").hide();
};
APP.removeIso = function(){
  $(".isochrone").remove();
};
// function to remove raster isochrones
APP.removeRast = function(){
  $(".pix").hide();
  stopsLoaded = 0;
  pixLoaded = 0;
};
// function to initialize SVG
APP.initIso = function(dataJson){
  // sorting time datas
  dataSort = dataScale.sort(function(a, b) {
    return a - b;
  });
  // reverse the colors because of superimpose
  colorsR = colors.slice().reverse();
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
      if(check == true){
        upd.enter()
           .append('path')
           .attr('d', proj.pathFromGeojson)
           .attr('fill-opacity', '0.2')
           .attr('fill', function(d){return color(d.properties.time);})
           // .style('position','relative')
           // .attr('pointer-events','visible')
           .classed("isochrone", true);
        upd.attr('stroke-width', 0.1 / proj.scale);// for updating the stroke when zooming
      }
  });
  // load the data to project
  d3.json(dataJson, function(data) {
    dataOverlay.addTo(map);
   });
};
// function to load the datas of OTP API
APP.loadDataOtp = function(){
  console.log(mode,"3");
    d3.json(urlOtp, function(error, data) {
      if(error) {
        console.log(error);
      }
      APP.jsonToArray(data);
      APP.stopsTooltip(stops);
    });
};

// function to load the datas of psql server
APP.loadDataPsql = function(){
    // empty array to push new datas
    dataArrayS = [];
    dataScaleS = [];
    d3.json(urlPsql, function(error, data) {
      if(error) {
        console.log(error);
      }
      // console.log(data);
      dataS = data;
      for (var i=0; i < data.length; i++){
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
    });
};
// fucntion to choose the type of pixels to load
APP.choose = function(){
  if(urlPsql.indexOf("sd")) {
    console.log(urlPsql);
    if(stopsLoaded==1){
      APP.changeColor(dataArrayS, pixels);
    } else {
      APP.loadStops(dataArrayS);
    }
  } else {
    if(pixLoaded==1){
      APP.changeColor(dataArrayS, pixels);
    } else{
      APP.loadPixels(dataArrayS);
    }
  }
};

// function to load the datas of stops
APP.loadStops = function(dataArrayS){
  APP.removeRast();
    d3.json("stops", function(error, data) {
      if(error) {
        console.log(error);
      }
      stops = data.features;
      var stopsOverlay = L.d3SvgOverlay(function(sel, proj) {
      var upd = sel.selectAll('path')
                   .data(stops);
          // update the projection of the SVG
          upd.enter()
             .append('path')
             .attr('d', proj.pathFromGeojson)
             .attr('fill-opacity', '0.2')
             .attr('fill', function(d){return "blue";})
             .attr('z-index', 1000)
             .classed("stops", true);
          upd.attr('stroke-width', 0.1 / proj.scale); // for updating the stroke when zooming
      });
      // Add in the layer control
      // LC.addOverlay(stopsOverlay, "Arrêts de TP");
      // load the data to project
      d3.json(stops, function(data) {
        console.log(stops);
      stopsOverlay.addTo(map);
      });
    });
    APP.stopsTooltip(stops);
    stopsLoaded = 1;
 };
 // function to join datas to the pixels
 APP.dataJoin = function(dataArrayS, pixels){
   // Retrieve the id of the data and link it to the geospatial geoid
   //For each pixel get the ID and assign the data value (if there is a corresponding one
  dataSum = [0,0,0,0,0,0,0,0];
  for (var j=0; j < pixels.length; j++) {
     pixels[j].properties.time = 0;
     var jsonId = pixels[j].properties.rastid;
     var jsonPop = pixels[j].properties.sum;
     for (var i = 0; i < dataArrayS.length; i++) {
      //Grab the pixel ID
      var dataId = dataArrayS[i].id;
       if (dataId == jsonId) {
         // spatial join
         pixels[j].properties.time = dataArrayS[i].time;
         // find the number of people in each area

         if (pixels[j].properties.time < 600) {
           dataSum[0] += pixels[j].properties.sum;
         } else if (pixels[j].properties.time > 600 && pixels[j].properties.time < 1200){
           dataSum[1] += pixels[j].properties.sum;
         } else if (pixels[j].properties.time > 1200 && pixels[j].properties.time < 1800){
           dataSum[2] += pixels[j].properties.sum;
         } else if (pixels[j].properties.time > 1800 && pixels[j].properties.time < 2400){
           dataSum[3] += pixels[j].properties.sum;
         } else if (pixels[j].properties.time > 2400 && pixels[j].properties.time < 3000){
           dataSum[4] += pixels[j].properties.sum;
         } else if (pixels[j].properties.time > 3000 && pixels[j].properties.time < 3600){
           dataSum[5] += pixels[j].properties.sum;
         } else if (pixels[j].properties.time > 3600){
           dataSum[6] += pixels[j].properties.sum;
         }

         break;
       }
     }
   }
   for (var k=0; k < dataSum.length-1; k++) {
     dataSum[7] += dataSum[k];
   }
   APP.createLegend();
 };
 // function to scale the colors of pixels
 APP.colorize = function(){
   //Define the color domain according to the data
   // reverse the colors because of superimpose
   colorsRRS = colors.slice().reverse();
   min = d3.min(dataScaleS);
   max = d3.max(dataScaleS);
   console.log(min,max);
   colorRS = d3.scale.threshold()
                       // .domain([min,max])
                       .domain([0, 601, 1201, 1801, 2401, 3001, 3601])
                       .range(colorsRRS);
 };
 // function to load the datas
 APP.loadPixels = function(dataArrayS){
     d3.json("pix", function(error, data) {
       if(error) {
         console.log(error);
       }
       pixLoaded = 1;
       pixels = data.features;
       console.log(pixels);
       APP.colorize();
       APP.dataJoin(dataArrayS, pixels);
       var pixelsOverlay = L.d3SvgOverlay(function(sel, proj) {
       var upd = sel.selectAll('path')
                    .data(pixels);
           // update the projection of the SVG
           upd.enter()
              .append('path')
              .attr('d', proj.pathFromGeojson)
              .attr('fill-opacity', '0.2')
              .attr('fill', function(d){
               var value = d.properties.time;
               // var value = d.properties.sum;
               if (value) {
                 // console.log(colorRS(value));
                 return colorRS(value);
                 } else {
                   return "#ccc";
                 }
              })
              .attr('class', function(d){
               var value = d.properties.time;
               // var value = d.properties.sum;
               if (value) {
                 // console.log(colorRS(value));
                 return "pix " + colorRS(value);
                 } else {
                   return "pix #ccc";
                 }
              })
              .attr("pointer-events","visible");
           upd.attr('stroke-width', 0.1 / proj.scale); // for updating the stroke when zooming
       });
       // Add in the layer control
       // LC.addOverlay(pixelsOverlay, "Pixels de populations");
       // load the data to project
       d3.json(pixels, function(data) {
       pixelsOverlay.addTo(map);
       });
     });
     pixLoaded = 1;
     APP.pixelsTooltip();
  };
// function to store the data into arrays
APP.jsonToArray = function(data){
  dataJson = data.features;
  // empty array to push new datas
  dataScale = [];
  for (var i=0; i < data.features.length; i++){
    dataScale.push(
      data.features[i].properties.time
    );
  }
  for (i = 0; i < data.features.length; i++){
    console.log(data.features[i].properties);
    dataArray.push({
      id : data.features[i].id,
      time : data.features[i].properties.time
    });
  }
  APP.initIso(dataJson);
};

// Defining tooltip events
APP.pixelsTooltip = function(pixels){
  setTimeout(function(){
      d3.selectAll('.pix')
        .on('mouseover', function(pixels) {
          d3.select(this)
          .transition()
          .duration(50);
          tooltipMap.html(function(){
            return `Population: ${pixels.properties.sum}`;
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
          .duration(150);
          tooltipMap.transition()
          .duration(150)
          .style("opacity", 0);
        });
  }, 500);
};
// Defining tooltip events
APP.stopsTooltip = function(stops){
  setTimeout(function(){
      d3.selectAll('.stops')
        .on('mouseover', function(stops) {
          d3.select(this)
          .transition()
          .duration(50);
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
// Creation of the legend
APP.createLegend = function(){
  APP.removeLegend();
  // leaflet legend
  var legend = L.control({position: 'bottomright'});
  // legend function
  legend.onAdd = function (map) {
      // leaflet div
      var div = L.DomUtil.create('div', 'info legend'),
          // 7 steps between 0 to 60 minutes
          grades = [0, 10, 20, 30, 40, 50, 60];
      // labels of the legend
      var divHTML = `<table class="tableg"><tr><th class="th1">Population<br>par zone</th><th></th><th class="th2">Temps<br>en minutes</th></tr>`
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          divHTML +=
              `<tr><td class="td1"> ${dataSum[i]} </td><td class="td2"> <i style="background: ${colorsR[i+1]}"></i></td><td class="td3"> ${grades[i]}` + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+') +`</td></tr>`
      }
      // finish the div
      divHTML += `</table>`
      div.innerHTML = divHTML;
      return div;
  };
  legend.addTo(map);
}
// remove the legend
APP.removeLegend = function(){
  $(".legend").remove();
}
