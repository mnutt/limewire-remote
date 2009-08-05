jQuery(document).ready(function(){
  $.cometd.subscribe('/search', this, receiveSearchResult);

  $('#search_form').submit(function() {
    var query = $('#search_form input').val();
    $('window').attr("title", "Search for \"" + query + "\"");
    $('#results').html('&nbsp;');
    startComet(query);
    return false;
  });

  $('.result h2').live('dblclick', triggerDownload);
	//		 $('.result .player img').live('click', threeSixtyPlayer.buttonClick);
  //$('.result .player img').live('mousedown', threeSixtyPlayer.mouseDown);
});

var urnCache = [];

var startComet = function(guid) {
  $.cometd.publish('/search', guid);
};

var submitSearch = function(query) {
  $.post('/search', {query: query}, function(search) {
    var guid = search.guid;
    startComet(guid);
  }, "json");
  return false;
};

var playerDiv = function() {
  var div = $("<div class='player ui360'></div>");
  return div;
};

var receiveSearchResult = function(result) {
  if(result.data && result.data.new_search) {
    $('#results').data('guid', result.data.guid);
    return;
  }

  if(!result.data || !result.data.sha1) { return; }
  result = result.data;

  if($('#'+result.sha1).length == 0) {
    var resultDiv = $("<div id='"+result.sha1+"' class='result'></div>");

    var player = playerDiv();
    var urn = result.sha1;
    var guid = $('#results').data('guid');
    var streamUrl = "/stream/stream.mp3?guid="+guid+"&urn="+urn;
    var link = $("<a href='"+streamUrl+"'>Play</a>");
    player.append(link);
    resultDiv.append(player);

    if(result.title && result.author) {
      resultDiv.append($("<h2>").text(result.author + " - " + result.title));
    } else {
      resultDiv.append($("<h2>").text(result.name));
    }

    // Assemble tags

    var tags = [];
    if(result.author) {
      tags.push(result.author);
    }
    if(result.genre) {
      tags.push(result.genre);
    }
    tags.push("gnutella");
    if(result.title) {
      for each(word in result.title.split(' ')) {
	tags.push(word);
      }
    }
    for each(word in result.name.split(/[^A-Za-z0-9]+/)) {
      tags.push(word);
    }

    var tagsDiv = $("<div class='tags'></div>");
    for each(tag in tags) {
      tagsDiv.append("<a href='#'>"+tag+"</a>");
    }

    resultDiv.append(tagsDiv);

    resultDiv.append("<div class='clear'></div>");

    // if(!result.in_library) {
    //   treeRow.append($(document.createElement('treecell')).addClass('from').attr('label', "" + result.sources.length + " Source(s)"));
    // } else {
    //   treeRow.append($(document.createElement('treecell')).addClass('from').attr('label', "Library"));
    // }

    // treeRow.append($(document.createElement('treecell')).addClass('extension').attr('label', result.filename.split('.').reverse()[0]));
    // treeRow.append($(document.createElement('treecell')).addClass('size').attr('label', size_format(result.file_size)));

    $('#results').append(resultDiv);
    threeSixtyPlayer.addLink(link.get(0));

    //if(index == 0) { $("#results li:first").addClass("selected"); }
    //$('#results li:last').click(startDownload);
  }
};

var triggerDownload = function(click) {
  $('#downloads').show();
  if(click.type == "dblclick") {
    var sel = click.currentTarget.currentIndex;
  } else {
    var sel = $(document.popupNode).context._lastSelectedRow;
  }
  var row = $('#results treeitem').get(sel);

  var sha1 = $(row).attr('id');
  var guid = $('#results treechildren').attr('id');
  $.post('/downloads', {urn: sha1, guid: guid}, function(guid) {});
};

var triggerPreview = function(click) {
  var sel = click.currentTarget.currentIndex;
  var row = $('#results treeitem').get(sel);
  var left = $('#space-label').get(0).clientLeft;
  var right = left + $('#space-label').get(0).clientWidth;

  if(click.clientX > left && click.clientX < right) {
    var urn = row.id;
    urnCache.push(urn);
    var guid = $('#results treechildren').attr('id');
    var url = "/stream/stream.mp3?guid="+guid+"&urn="+urn;
    $(row).find('treecell:first').attr("properties", "playing");
    soundManager.stopAll();
    var previewSound = soundManager.createSound({
      id: urn,
      url: url,
      volume: 100,
      whileplaying: function() {
	var time = getTime(this.position, true);
	var label = '▸' + " " + time;
	var el = $('#'+this.sID+' treecell:first');
	el.attr('label', label);
      }
    });
    previewSound.play();
  }
};

var getTime = function(nMSec,bAsString) {
    // convert milliseconds to mm:ss, return as object literal or string
    var nSec = Math.floor(nMSec/1000);
    var min = Math.floor(nSec/60);
    var sec = nSec-(min*60);
    // if (min == 0 && sec == 0) return null; // return 0:00 as null
    return (bAsString?(min+':'+(sec<10?'0'+sec:sec)):{'min':min,'sec':sec});
};
