;(function(){

if(window.location.pathname == '/activities'){
  var provider = 'strava';
  $('body').addClass('strava');
} else {
  var provider = 'foursquare';
  $('body').addClass('foursquare');
}

// L.Browser.retina = true;
var map = L.mapbox.map('map', 'bobbysud.gh5h48pm', {
  tileLayer: {
    detectRetina: true
  }
}).setView([37.8016,-122.4502], 14);;

// Menu settings
$('#menuToggle, .menu-close').on('click', function(){
  $('#menuToggle').toggleClass('active');
  $('body').toggleClass('body-push-toleft');
  $('#theMenu').toggleClass('menu-open');
});

var mapStyles = { 0: ['Streets','bobbysud.gh5h48pm'], 1: ['Terrain','bobbysud.map-8owxxni8'], 2: ['Satellite','bobbysud.map-ddwpawil'], 3: ['Grey','bobbysud.map-n7u3y01e'], 4: ['Windbreak', 'bobbysud.map-0c36p1bf'], 5: ['Afternoon', 'bobbysud.map-cfaq2kkp'], 6: ['Sunday\'s', 'bobbysud.map-3nbfdajb'], 7: ['Robin', 'bobbysud.gjbnl40i'], 8: ['Technic', 'bobbysud.map-sl83837k'] };
var colorStyles = { 0:'#f1f075', 1:'#eaf7ca', 2:'#c5e96f', 3:'#a3e46b', 4:'#7ec9b1', 5:'#b7ddf3', 6:'#63b6e5', 7:'#3ca0d3', 8:'#1087bf', 9:'#548cba', 10:'#677da7', 11:'#9c89cc', 12:'#c091e6', 13:'#d27591', 14:'#f86767', 15:'#e7857f', 16:'#fa946e', 17:'#f5c272', 18:'#ede8e4', 19:'#ffffff', 20:'#cccccc', 21:'#6c6c6c', 22:'#1f1f1f', 23:'#000000' };

$.each(colorStyles, function(key, value){
  $('.map-style.line').append('' +
    '<li class=' + value +'>' +
        '<div style="background-color:' + value + ';"></div>' +
    '</li>')
});

$.each(mapStyles, function(key, value){
  $('.map-style.map').append('' +
    '<li class=' + value[1] + '>' +
        '<img src="https://api.tiles.mapbox.com/v3/' + value[1] + '/' + map.getCenter().lng +',' + map.getCenter().lat + ',' + map.getZoom() + '/120x120.png" />' +
        '<div>' + value[0] + '</div>' +
    '</li>')
});

document.getElementById('output').addEventListener('click', function() {
  leafletImage(map, doImage);  
});
 
function doImage(err, canvas) {
  var img = document.createElement('img');
  var dimensions = map.getSize();
  img.width = dimensions.x*10;
  img.height = dimensions.y*10;
  var imgSend = canvas.toDataURL();

  $.ajax({
    url:'/image',
    type: 'POST',
    data: {
      image: imgSend,
    },
    success: function(e){
      var data = JSON.parse(e.data);
      alert(data.url);
      $('.buynow').attr('data-cp-url', data.url).click();
    }
  });
  
  map.invalidateSize();
};

function displayData(userData){

  for (var i = 0; i < userData.length; i++) {
  	var poly = L.Polyline.fromEncoded(userData[i].map.summary_polyline);
    L.polyline(poly.getLatLngs(),{
      'color': '#F86767',
      'opacity': '.8',
      'weight': '12'
    }).addTo(geoGroup);

    if(i == userData.length - 1){
      // map.fitBounds(geoGroup.getBounds());
      map.addLayer(geoGroup);
    }
  }

}//run displayData

function clearMap() {
  for(i in map._layers) {
    if(map._layers[i]._tiles !== undefined) {
        map.removeLayer(map._layers[i]);
    }
  }
}

$('.width').change(function(){
  geoGroup.eachLayer(function (layer) {
    layer.setStyle({
      weight: $('.width').val()
    });
  });
});

$('.opacity').change(function(){
  $('.leaflet-marker-icon').css('opacity', $('.opacity').val()/100 );
  geoGroup.eachLayer(function (layer) {
    layer.setStyle({
      opacity: $('.opacity').val()/100
    });
    layer.setStyle({
      fillOpacity: $('.opacity').val()/100
    });
    console.log($('.opacity').val()/100)
  });
});

$('.map-style.line li').click(function(e){
  var colorClicked = $(this).attr('class');
  console.log(colorClicked)
  if(provider == 'foursquare') {
    if(colorClicked == undefined){
      geoGroup.clearLayers(map);
      for(var i = 0; acts.length; i++){
        add4sq(acts[i])
      }
    }else{
      if($('.map-style.line').hasClass('marker')){
        geoGroup.eachLayer(function (layer) {
          var newL = L.mapbox.marker.icon({
            'marker-color': colorClicked,
          })
          layer.setIcon(newL)
        });
      } else {
        geoGroup.eachLayer(function(layer){
          layer.setStyle({
            fillColor: colorClicked,
            color: colorClicked
          });
        });
      }
    }
  }

  if(provider == 'strava'){
    geoGroup.eachLayer(function (layer) {
      layer.setStyle({
        color: colorClicked
      });
    });
  }

});

$('.map-style.map li').click(function(e){
  var layer = $(this).attr('class');
  clearMap();
  L.mapbox.tileLayer(layer).addTo(map);
});

var geoGroup = L.layerGroup();

function add4sq(data, style) {
  $('.map-style li:last').hide()
  try {
    var c = JSON.parse(data)  
  } catch(e) {
    console.log(e)
  }
  
  var checkins = c.response.checkins.items;
  for (var i = 0; i < checkins.length; i++) {
    var uri = '/images/4sq_border/' + checkins[i].venue.categories[0].icon.prefix.split('/')[5] + '/' + checkins[i].venue.categories[0].icon.prefix.split('/')[6].slice(0,-1) + '.png';

    if(style == 'icon') {
      var fourIcon = L.icon({
        iconUrl: uri,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, 0],
      })
      
      L.marker([checkins[i].venue.location.lat,checkins[i].venue.location.lng], {
        icon: fourIcon
      })
        .bindPopup(checkins[i].venue.name)
        .addTo(geoGroup);

      $('.leaflet-marker-icon').error(function () {
        $(this).attr('src', '/images/4sq_border/' + $(this).attr('src').split('/')[3] + '/default.png');
      });
      $('.map-style.line').addClass('marker');
      $('.map-style.line').removeClass('circle');
    } else {
      
      if( checkins[i].venue.beenHere.count <= 5){
        var numCheckins = 50;
      }
      if(  checkins[i].venue.beenHere.count > 5 &&  checkins[i].venue.beenHere.count <= 20) {
       var numCheckins = 200;
      }
      if(  checkins[i].venue.beenHere.count > 20) {
       var numCheckins = 500;
      }

      L.circle([checkins[i].venue.location.lat,checkins[i].venue.location.lng], numCheckins,{
        stroke:false
      })
        .bindPopup(checkins[i].venue.name)
        .addTo(geoGroup);
      $('.map-style.line').removeClass('marker');
      $('.map-style.line').addClass('circle');
    }

    if(i == checkins.length - 1){
      geoGroup.addTo(map);
      // map.fitBounds(geoGroup.getBounds());
    }

  }
}//Add 4sq

if(provider == 'foursquare') {
  for(var i = 0; acts.length; i++){
    add4sq(acts[i], 'circle')
  }
}else {
  displayData(acts)
}


// printing
(function ( d, s, id ) {
  var js, cpJs = d.getElementsByTagName( s )[0], t = new Date();
  if ( d.getElementById( id ) ) return;
  js = d.createElement( s );
  js.id = id;
  js.setAttribute( 'data-cp-url', 'https://store.canvaspop.com' );
  js.src = 'https://store.canvaspop.com/static/js/cpopstore.js?bust=' + t.getTime();
  cpJs.parentNode.insertBefore( js, cpJs );
}( document, 'script', 'canvaspop-jssdk' ));

})(jQuery)