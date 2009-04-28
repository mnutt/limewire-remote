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
  f = document.getElementById("twitterCount");
  p = document.getElementById("postForm");
  d = document.getElementById("dialogbox");
  if (m) { m.style.top = 0; m.style.left = 0;  m.style.width=w; m.style.height=h; }
  if (c) { c.style.top = h-30; }
  if (f) { f.style.left = center_w-100; }
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

var ips = [];

function loadData() {
  $.getJSON('/world_view/hosts', function(data) {
	      ips = sortByLocation(data);
	      $("#twitterCount").text(ips.length + " hosts");
	      for(i in ips) {
		var ip = ips.shift();
		showIP(ip, false);
		if(i == 10) { showStaggered(); break; }
	      };
  });

  setTimeout("$(\"#splash\").fadeOut(\"slow\");", 3000);
}

function sortByLocation(ips) {
  return ips;
}

function showStaggered() {
  ip = ips.shift();
  showIP(ip, true);
  setTimeout("showStaggered()", 2000);
}

function showIP(ip, showBox) {
  $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fiplocationtools.com%2Fip_query.php%3Fip%3D"+ip+"'&format=json&callback=?", function(data) {
    var loc = data.query.results.Response;
    showHost(loc, showBox);
  });
}

var map_icon = addOptionsToIcon(new GIcon(),{iconSize : new GSize(20,34), iconAnchor : new GPoint(10,32), infoWindowAnchor : new GPoint(20,10), image : '/assets/world_view/lime-marker.png'});

function showHost(loc, showBox) {
  map.closeInfoWindow();
  var latLng = new GLatLng(loc.Latitude, loc.Longitude);
  var marker = new GMarker(latLng, { icon: map_icon });

  map.addOverlay(marker);
  if(showBox) {
    map.openInfoWindow(marker.getLatLng(), infoWindow(loc).get(0), {noCloseOnClick : true, pixelOffset : new GSize(5, -20) } );
  }
}

function infoWindow(loc) {
  var ip = $("<div class='ip'>"+loc.Ip+"</div>");
  var addr = $("<div class='addr'>"+loc.City+", "+loc.RegionName+", "+loc.CountryCode+"</div>");
  var infoWindow = $("<div id='infoWindow'></div>");
  infoWindow.append(ip);
  infoWindow.append(addr);
  $("body").append(infoWindow);
  return infoWindow;
}

function wheelZoom(a) { (a.detail || -a.wheelDelta) < 0 ? map.zoomIn() : map.zoomOut(); }

$(document).ready(function() {
  if (GBrowserIsCompatible()) {
    sizeMap();
    GEvent.addDomListener(document.getElementById('map'), "DOMMouseScroll", wheelZoom);
    GEvent.addDomListener(document.getElementById('map'), "mousewheel", wheelZoom);
    // setTimeout("new Effect.Fade('splash')", 3500);
    $("#quickguide").click(function () { new Effect.Fade('quickguide') });
    $('systemstatus').click(function () { new Effect.Fade('systemstatus'); });
    loadData();
  } else {
    alert("Sorry, your browser isn't compatible with WorldView!");
  }
});