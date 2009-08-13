jQuery(document).ready(function(){
  $.cometd.subscribe('/search', this, receiveSearchResult);

  var query = $.getURLParam('q');
  $('window').attr("title", "Search for \"" + query + "\"");
  // submitSearch(query);
  startComet(query);
  $('#results').dblclick(triggerDownload);
  $('#results').click(triggerPreview);

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

var receiveSearchResult = function(result) {
  if(result.data && result.data.new_search) {
    $('#results treechildren').attr('id', result.data.guid);
    return;
  }

  if(!result.data || !result.data.sha1) { return; }
  result = result.data;

  if($('#'+result.sha1).length == 0) {
    var treeItem = $(document.createElement('treeitem')).addClass('result').attr('id', result.sha1);
    var treeRow = $(document.createElement('treerow'));

    treeRow.append($(document.createElement('treecell')).addClass('space').attr('label', '▸').attr('properties', 'defaultHide'));

    if(result.title && result.author) {
      treeRow.append($(document.createElement('treecell')).addClass('name').attr('label', result.author + " - " + result.title));
    } else {
      treeRow.append($(document.createElement('treecell')).addClass('name').attr('label', result.name));
    }

    if(!result.in_library) {
      treeRow.append($(document.createElement('treecell')).addClass('from').attr('label', "" + result.sources.length + " Source(s)"));
    } else {
      treeRow.append($(document.createElement('treecell')).addClass('from').attr('label', "Library"));
    }

    treeRow.append($(document.createElement('treecell')).addClass('extension').attr('label', result.filename.split('.').reverse()[0]));
    treeRow.append($(document.createElement('treecell')).addClass('size').attr('label', size_format(result.file_size)));

    treeItem.append(treeRow);
    $('#results treechildren').append(treeItem);
    treeItem.attr('context', 'resultpopup');

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
    console.log(url);
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
