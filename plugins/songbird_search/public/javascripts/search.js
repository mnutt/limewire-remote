jQuery(document).ready(function(){
  $.cometd.subscribe('/search', this, receiveSearchResult);

  var query = $.getURLParam('q');
  $('window').attr("title", "Search for \"" + query + "\"");
  //submitSearch(query);
  startComet(query);
  $('#results').dblclick(triggerDownload);
});

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

    treeRow.append($(document.createElement('treecell')).addClass('space').attr('label', ' '));
    if(!result.in_library) {
      treeRow.append($(document.createElement('treecell')).addClass('from').attr('label', "" + result.sources.length + " Source(s)"));
    } else {
      treeRow.append($(document.createElement('treecell')).addClass('from').attr('label', "Library"));
    }

    if(result.title && result.author) {
      treeRow.append($(document.createElement('treecell')).addClass('name').attr('label', result.author + " - " + result.title));
    } else {
      treeRow.append($(document.createElement('treecell')).addClass('name').attr('label', result.name));
    }

    treeRow.append($(document.createElement('treecell')).addClass('extension').attr('label', result.filename.split('.').reverse()[0]));
    treeRow.append($(document.createElement('treecell')).addClass('type').attr('label', result.category));
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