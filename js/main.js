/* Scripts by Tobin McGilligan, 2015 */

//function to instantiate the Leaflet map
function createMap(){

  var map = L.map('map', {
      center: [43.075865, -89.400984],
      zoom: 4,
  });

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 10,
      id: 'tobinmcg.p4biih0o',
      accessToken: 'pk.eyJ1IjoidG9iaW5tY2ciLCJhIjoiZWViZjgzODg4NGJiODc3YTQ4YjVhNmQ1NTQ2OTE3ODYifQ.IQc9cPbv4yG-kTMVmkiU7g'
  }).addTo(map);

  getData(map);
};

//function to retrieve the data and place it on the map
function getData(map){

    $.ajax("data/priceToRentRatios/biggestCities_PriceToRentRatio.geojson", {
        dataType: "json",
        success: function(response){
            //create a Leaflet GeoJSON Cluster Group layer
            var priceToRentRatiosClusterGroup = L.markerClusterGroup({
              showCoverageOnHover: false,
              maxClusterRadius: 20,
            });
            var priceToRentRatiosGeoJSON = L.geoJson(response, geoJsonFunctionOptions);
            //add the JSON to the Cluster group, and the cluster to the map
            priceToRentRatiosClusterGroup.addLayer(priceToRentRatiosGeoJSON);
            map.addLayer(priceToRentRatiosClusterGroup);

            //get attribute labels
            var attributes = extractAttributeLabels(response);

            //Create Map Control Elements
            setupElements(map, attributes);
        }
    });
};

//this object passed to L.geoJson();
var geoJsonFunctionOptions = {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        //circleMarkerOptions
        radius: calcPropRadius(feature.properties['2015-12']),
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: onEachFeature,
    /*filter: function(feature, layer) {
        return feature.properties.Pop_2015 > 20;
    },*/
};

function calcPropRadius(attValue) {

    var radius;

    //continuous values
    //scale factor to adjust symbol size evenly
    var scaleFactor = 1.5;
    //radius calculated based on area
    radius = (attValue*scaleFactor)-6;

    //discrete values
    /*if (attValue <= 10) {
      radius = 4;
    } else if (attValue > 10 && attValue <= 12.5) {
      radius = 6;
    } else if (attValue > 12.5 && attValue <= 15) {
      radius = 8;
    } else if (attValue > 15) {
      radius = 10;
    } else {
      console.log('attribute value not accounted for!');
    }*/

    return radius;
};

function generatePopup(feature, attribute) {
  return '<strong>' + feature.properties['toGeocode'] + '</strong>' + '</br>'
    + '<span class="popupAttributeLabel">Price-to-Rent Ratio <em>(' + attribute + ')</em></span>' + '</br>'
    + '<span class="popupAttributeValue">' + feature.properties[attribute];
}

function onEachFeature(feature, layer) {
    var popupContent = generatePopup(feature, '2015-12');
    onEachFeaturePopupSetup(layer, popupContent);
};

function onEachFeaturePopupSetup(layer, popupContent) {
  //event listeners to open popup on hover,
  //and close it on un-hover, with no flickering
  //and disabling clickability
  layer.on({
    mouseover: function(){
      this.bindPopup(popupContent, {
        offset: new L.Point(0,-6),
        className: 'activePopup',
      }).openPopup().unbindPopup();
      // ^^ binding the popup, opening it, and unbinding it
      //means the user can't click the icon after hover and
      //make the popup flicker on/off
    },
    mouseout: function(){
      $('.activePopup').hide(); //we assigned a class above so we could
      //do this, despite the fact that the popup is no longer bound
      //to the marker, tehehehe ;)
    },
    click: function() {
      $('#dialog').html(popupContent);
    },
  });
}

function extractAttributeLabels(data) {
  //empty array to hold attributes
  var attributes = [];

  //properties of the first feature in the dataset
  var properties = data.features[0].properties;

  //push each attribute name into attributes array
  for (var attribute in properties){
      //only take attributes with price-to-rent ratios
      if (attribute.indexOf("20") > -1){
          attributes.push(attribute);
      };
  };

  return attributes;
}

function setupElements(map, attributes) {

  // DIALOG //
  $('#dialog').dialog({
    width: 300,
    dialogClass: 'moreInfo',
    resizable: false,
    closeText: 'Dock',
    beforeClose: function () {
        $(this).dialog('option', 'position',
          { my: "right bottom", at: "right-10 bottom-27.5", of: window});
        return false;
    },
    position: { my: "right bottom", at: "right-10 bottom-27.5", of: window},
  });
  $('#dialog').dialog('open');

  // Modifying the close buttons behavior and adding another one
  //this first line selects the existing close button
  $('.moreInfo .ui-dialog-titlebar .ui-dialog-titlebar-close[title="Dock"] .ui-icon')
    //remove extraneous classes
    .removeClass('ui-icon-closethick').removeClass('ui-button-icon-primary')
    .addClass('ui-icon-carat-1-se'); //add this class, which has a different symbol
  // Here, we clone the existing close button, and append the copy
  $('.moreInfo .ui-dialog-titlebar').append(
    $('.moreInfo .ui-dialog-titlebar-close').clone()
    //then we move it over a bit and change its title attribute so we can identify it
    .css('right', '28px').attr('title', 'Expand')
  );
  // Now, we select the icon within the cloned copy
  $('.moreInfo .ui-dialog-titlebar .ui-dialog-titlebar-close[title="Expand"] .ui-icon')
    .removeClass('ui-icon-carat-1-sw').addClass('ui-icon-plus') //and change its classes
    //add an event listener & function
    .on('click', function() {
      window.alert('Sorry, this functionality has not been implemented yet!');
    });

  // SLIDER //
  $( "#slider" ).slider({
    min: 1,
    max: 63,
    value: 63,
    step: 1,
    change: function(event, ui) {
      //console.log('value changed to ' + ui.value);
      var attribute = ui.value-1;
      // Update Proportional Symbols
      map.eachLayer(function(layer) {
        //if the layer is a feature AND has the given property
        if (layer.feature && layer.feature.properties[attributes[attribute]]) {
          //access feature properties
          var props = layer.feature.properties;

          //update each feature's radius based on new attribute values
          var radius = calcPropRadius(props[attributes[attribute]]);
          layer.setRadius(radius);

          var popupContent = generatePopup(layer.feature, attributes[attribute]);
          onEachFeaturePopupSetup(layer, popupContent);
        }
      });
    },
  });
  $( "#slider, #slider span" ).on('mouseover', function() {
    $(this).css('cursor', 'pointer');
  });

  // SLIDER CONTROLS //
  $('#slider-buttons').on('mouseover', function() {
    $(this).css('cursor', 'pointer');
  });
  //fast backward
  $('#slider-buttons .fa-fast-backward').on('click', function() {
    $('#slider').slider('value', $('#slider').slider('option', 'min'));
  });
  //step backward
  $('#slider-buttons .fa-step-backward').on('click', function() {
    $('#slider').slider('value', $('#slider').slider('value')-1);
  });
  //play
  $('#slider-buttons .fa-play').on('click', function() {
    //$(this).removeClass('fa-play').addClass('fa-pause');
    window.alert('Sorry, this functionality has not been implemented yet!');
  });
  //step forward
  $('#slider-buttons .fa-step-forward').on('click', function() {
    $('#slider').slider('value', $('#slider').slider('value')+1);
  });
  //fast forward
  $('#slider-buttons .fa-fast-forward').on('click', function() {
    $('#slider').slider('value', $('#slider').slider('option', 'max'));
  });
}

$(document).ready(createMap);