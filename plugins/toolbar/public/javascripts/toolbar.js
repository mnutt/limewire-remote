// implement the music player here.
soundManager.url = '/flash/';
var p = new Fabs.boombox.Player({
				  autoPlay: false,
				  shuffle:false,
				  volume:40
				});

var tracks = [
  {
    url: 'http://blog.limewire.com/wp-content/uploads/2009/04/born_on_a_day_the_sun_didnt_rise.mp3',
    title: 'Andy Suzuki & The Method - 300 Pianos'
  }
];


$.getJSON('/library', function(result) {
  for(var i in result) {
    var file = result[i];

    if(file.artist && file.title) {
      var metadata = "" + file.artist.name + " - " + file.title;
    } else {
      continue;
    }

    var track = {
      url: file.uri,
      title: metadata
    };
    p.getPlaylist().addTracks([track]);
  }

});

p.getPlaylist().addTracks(tracks);


window.ui = new Fabs.boombox.ui.FullPlayer({
					     player: p,
					     renderTo: 'boombox',
					     width: null,
					     maxListHeight: 350,
					     draggable: false,
					     resizeable: true
					   });

$(document).ready(function() {

  var cometURL = document.location.protocol + '//' + document.location.hostname + ':' + document.location.port + '/comet';
  $.cometd.init(cometURL);

  $('.open-search').live('click', function() {
    $('.bb-search').show();
    $('.bb-search input').focus();
    $('.bb-search input').blur(function() {
      //$('.bb-search').hide();
    });
  });

  $('.bb-search #local, .bb-search #remote').live('click', function() {
    $(this).toggleClass('selected');
    $('.bb-search form').triggerHandler('submit');
  });

  var createResultElement = function(title, url) {
    var scroller = Ext.get($('.bb-playlist-scroller').get(0)); // wow.  just wow.
  };

  var showSearchResultsContainer = function() {
    var container = $('div.bb-search-results-ct');
    container.find('.bb-search-results').html('');
    container.width($('div.bb-track-ct').width());

    $('.bb-search-results-ct').mouseleave(function() {
      sortSearchResults();
    });

    $('.bb-search-results-ct').animate({height: ui.maxListHeight, opacity: 1});
    try { parent.resizeWindow(32 + playlistHeight); } catch(e) {}
  };

  var sortSearchResults = function() {
    var mylist = $('.bb-search-results');
    var listitems = mylist.children('a').get();
    listitems.sort(function(a, b) {
      var compA = $(a).text().toUpperCase();
      var compB = $(b).text().toUpperCase();
      return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    });
    $.each(listitems, function(idx, itm) { mylist.append(itm); });
  };

  var receiveSearchResult = function(result) {
    if(result.data && result.data.new_search) {
      $('.bb-search-results').data('guid', result.data.guid);
      console.log("Got search " + result.data.guid);
      return;
    }

    if(!result.data || !result.data.sha1) { console.log("nodata"); return; }

    var result = result.data;
    if($('#'+urn).length == 0) {
      var urn = result.sha1;
      var guid = $('.bb-search-results').data('guid');
      var streamUrl = "/stream/stream.mp3?guid="+guid+"&urn="+urn;

      if(result.title && result.author) {
	var metadata = result.author + " - " + result.title;
      } else {
	var metadata = result.name;
      }

      // p.getPlaylist().addTrack({ title: metadata, url: streamUrl });
      var resultDiv = $("<a id='"+urn+"' href='"+streamUrl+"' class='bb-track remote'>"+metadata+"</a>");
      $('.bb-search-results').append(resultDiv);
    }
  };
  $.cometd.subscribe('/search', this, receiveSearchResult);

  var findLocalResults = function(query) {
    for(var i in p.getPlaylist().tracks.items) {
      var track = p.getPlaylist().tracks.items[i];
      if(!track.title) { continue; }
      if(track.title.toLowerCase().match(query.toLowerCase())) {
	console.log("FOUND");
	var urn = track.url.replace(/\/library\/([A-Z0-9]+)\.mp3/, "$1");
	var resultDiv = $("<a id='"+urn+"' href='"+track.url+"' class='bb-track local'>"+track.title+"</a>");
	$('.bb-search-results').append(resultDiv);
      }
    }
  };

  $('.bb-search form').live('submit', function() {
    var q = $('#q').val();

    $('#search-info').html("Search for <strong></strong>").find("strong").text(q);
    showSearchResultsContainer();

    if($('#remote').hasClass('selected')) {
      $.cometd.publish('/search', q);
    }

    if($('#local').hasClass('selected')) {
      findLocalResults(q);
    }

    return false;
  });

  $('.bb-search #close-search').live('click', function() {
    $('.bb-search').hide();
  });

});