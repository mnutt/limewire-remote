// Return new array with duplicate values removed
Array.prototype.unique = function() {
  var a = [];
  var l = this.length;
  for(var i=0; i<l; i++) {
    for(var j=i+1; j<l; j++) {
      // If this[i] is found later in the array
      if (this[i] === this[j])
        j = ++i;
    }
    a.push(this[i]);
  }
  return a;
};

function GetWindowWidthHeight () {
  var myWidth = 0, myHeight = 0;
  if(typeof(window.innerWidth) == 'number') {
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }

  return {'width' : myWidth, 'height' : myHeight};
}


function sizeMap () {

  var w = GetWindowWidthHeight().width;
  var h = GetWindowWidthHeight().height;

  center_w = w/2;
  m = document.getElementById("map");
  c = document.getElementById("mapCaption");
  s = document.getElementById("search");
  p = document.getElementById("postForm");
  d = document.getElementById("dialogbox");
  if (m) { m.style.top = 0; m.style.left = 0;  m.style.width=w; m.style.height=h; }
  if (c) { c.style.top = h-30; }
  if (s) { s.style.left = center_w-150; }
  if (p) { p.style.left = center_w-225; }
  if (d) { d.style.left = center_w-200; }

  map = new GMap2(document.getElementById("map"), {mapTypes: [G_PHYSICAL_MAP] });

  var agent=navigator.userAgent.toLowerCase();
  var is_iphone = (agent.indexOf('iphone')!=-1);

  if (is_iphone) {
    map.setCenter(new GLatLng(39,76), 3);
  } else {
    map.setCenter(new GLatLng(39,76), w>700 ? 3 : 2);
  }

  map.addControl(new GSmallMapControl());
  // addCustomControls();
}

var hostIps = [];
var myIp = '';
var myLat = 0;
var myLong = 0;
var downloadingIps = [];
var plottedIps = [];

function followHosts() {
  if($("#followHosts:checked").val() != null) {
    return true;
  }
}

function loadSelf() {
  $.get('/world_view/myself', function(data) {
    myIp = data;
    showIP(myIp, false, self_icon);
    loadDownloading();
  });
}

function loadDownloading() {
  $.getJSON('/world_view/downloading', function(data) {
    downloadingIps = data;
    $("#status .downloads").text(downloadingIps.length == 1 ?
				 "1 download" :
				 downloadingIps.length + " downloads");
    $.each(downloadingIps, function() {
      showIP(this, true, down_icon);
    });
    // loadHosts();
  });
}

function loadHosts() {
  $.getJSON('/world_view/hosts', function(data) {
    hostIps = sortByLocation(data);
    $("#status .hosts").text(hostIps.length + " hosts");
    for(i in hostIps) {
      var ip = hostIps.shift();
      showIP(ip, false);
      if(i == 10) { showStaggered(); break; }
    };
  });
  $("#status .loading").text('');
}

function sortByLocation(ips) {
  return ips;
}

function showStaggered() {
  if(hostIps.length == 0) { return; }
  var ip = hostIps.shift();
  showIP(ip, true);
  setTimeout("showStaggered()", 2000);
}

function showIP(ip, showBox, icon) {
  if($.inArray(ip, plottedIps) != -1) { return; }
  $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fiplocationtools.com%2Fip_query.php%3Fip%3D"+ip+"'&format=json&callback=?", function(data) {
    var loc = data.query.results.Response;
    showHost(loc, showBox, icon);
  });
  plottedIps.push(ip);
}

function alwaysOnTop(marker, b) {
  return 2500;
}

var host_icon = addOptionsToIcon(new GIcon(),{iconSize : new GSize(20,34), iconAnchor : new GPoint(10,32), infoWindowAnchor : new GPoint(20,10), image : '/assets/world_view/lime-marker.png'});
var self_icon = addOptionsToIcon(new GIcon(),{iconSize : new GSize(20,34), iconAnchor : new GPoint(10,32), infoWindowAnchor : new GPoint(20,10), image : '/assets/world_view/lime-marker-self.png'});
var down_icon = addOptionsToIcon(new GIcon(),{iconSize : new GSize(20,34), iconAnchor : new GPoint(10,32), infoWindowAnchor : new GPoint(20,10), image : '/assets/world_view/lime-marker.png'});

function showHost(loc, showBox, icon) {
  icon = icon || host_icon;

  map.closeInfoWindow();
  var latLng = new GLatLng(loc.Latitude, loc.Longitude);
  var marker = new GMarker(latLng, { icon: icon, title: loc.Ip });

  map.addOverlay(marker);
  if(showBox && followHosts()) {
    map.openInfoWindow(marker.getLatLng(), infoWindow(loc).get(0), {noCloseOnClick : true, pixelOffset : new GSize(5, -20) } );
  }

  $('#status div.loading').text("Found "+loc.Ip);

  if(icon == down_icon) {
    var p1Lat = (loc.Latitude + myLat) / 2;
    var p1Long = (loc.Longitude + myLong) / 2;
    var arrow = new _CArrow(latLng, new GLatLng(myLat, myLong), null, null, {
			      'enableEdit': false, color: '#222222', opacity: 0.5 });
    map.addOverlay(arrow);

    $("img[title="+loc.Ip+"]").effect("pulsate", { times: 200 }, 1000).get(0).style.zIndex = 2500;

    $("#map canvas").get(0).style.zIndex = 0;
  }
  if(icon == self_icon) {
    myLat = loc.Latitude;
    myLong = loc.Longitude;
    myLatLong = latLng;
    setTimeout("map.setCenter(myLatLong, 3);", 2000);
  }
}

function infoWindow(loc) {
  var ip = $("<div class='ip'>"+loc.Ip+"</div>");
  if(loc.City && loc.RegionName) {
    var addr = $("<div class='addr'>"+loc.City+", "+loc.RegionName+", "+loc.CountryCode+"</div>");
  } else {
    var addr = $("<div class='addr'>"+loc.CountryCode+"</div>");
  }
  var infoWindow = $("<div id='infoWindow'></div>");
  infoWindow.append(ip);
  infoWindow.append(addr);
  $("body").append(infoWindow);
  return infoWindow;
}

function startSearch(event) {
  var query = $("#search #query").val();
  $.post('/search', {query: query}, function(search) {
    var guid = search.guid;
    setTimeout("getSearchResults('"+guid+"')", 1000);
  }, "json");
  return false;
}

function getSearchResults(guid) {
  $.getJSON('/search/'+guid, function(search) {
    hostIps = $.map(search.results, function(result) {
      return result.sources;
    }).unique();
    showStaggered();
    setTimeout("getSearchResults('"+guid+"')", 3000);
  });
}

function getMoreSearchResults(guid) {
  $.getJSON('/search/'+guid, function(search) {
    hostIps = $.map(search.results, function(result) {
      return result.sources;
    }).unique();
    showStaggered();
    setTimeout("getMoreSearchResults('"+guid+"')", 3000);
  });
}


function wheelZoom(a) { (a.detail || -a.wheelDelta) < 0 ? map.zoomIn() : map.zoomOut(); }

$(document).ready(function() {
  if (GBrowserIsCompatible()) {
    sizeMap();
    GEvent.addDomListener(document.getElementById('map'), "DOMMouseScroll", wheelZoom);
    GEvent.addDomListener(document.getElementById('map'), "mousewheel", wheelZoom);
    $("#quickguide").click(function () { new Effect.Fade('quickguide') });
    $('systemstatus').click(function () { new Effect.Fade('systemstatus'); });
    $('#search form').submit(startSearch);
    loadSelf();
    setTimeout("$(\"#splash\").fadeOut(\"slow\");", 3000);
  } else {
    alert("Sorry, your browser isn't compatible with WorldView!");
  }
});