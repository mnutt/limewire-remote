jQuery(document).ready(function(){
  var queryCache = null;
  var guidCache = null;

  var submitSearch = function(query) {
    $.post('/search', {query: query}, function(search) {
      var guid = search.guid;
      getResultsForGuid(guid);
    }, "json");
    return false;
  };

  var getResultsForGuid = function(guid) {
    //$('#results').html('');
    // $('#results').before("<input type='hidden' name='guid' value='"+guid+"'>");
    var times_refreshed = 0;
    var _loadingSearch = false;
    $.periodic(function(controller) {
      if(_loadingSearch) { _loadingSearch = false; return true; }
      if(times_refreshed && times_refreshed > 20) { controller.stop(); }

      _loadingSearch = true;
      times_refreshed ? times_refreshed++ : times_refreshed = 1;

      $.getJSON("/search/" + guid, function(realData) {
	var results = eval(realData).results;
	if(results.length > 0) { $("#loading").hide(); }

	$.each(results, function(index, result) {
	  if($('#'+result.sha1).length == 0) {
	    var treeItem = $(document.createElement('treeitem')).addClass('result').attr('id', result.sha1);
	    var treeRow = $(document.createElement('treerow'));

	    treeRow.append($(document.createElement('treecell')).addClass('space').attr('label', ' '));
	    treeRow.append($(document.createElement('treecell')).addClass('from').attr('label', result.sources));
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

	    //if(index == 0) { $("#results li:first").addClass("selected"); }
	    //$('#results li:last').click(startDownload);
	  }

	  if($('#results treechildren').length > 50) {
	    controller.stop();
	  }
	});

	_loadingSearch = false;
      });
      return true;
    }, {frequency: 1});
  };

  var startDownload = function(ev) {
    var li = $(ev.target).parent();
    li.addClass("downloading");
    var urn = li.attr('id');
    var guid = $("#results input[name=guid]").val();
    $.post("/downloads", { urn: urn, guid: guid });
    var done = false;
    $.periodic(function(controller) {
      if(done) {
        li.click(function() {
          window.location = "/library/"+urn+".mp3";
            return false;
        });
        controller.stop();
      }
      $.getJSON("/downloads/"+urn, function(download) {
	li.find('.percent').text(download.percent_complete);
	console.log(download.percent_complete);
	li.find('.progress').css({ width: download.percent_complete+"%" });
	if(download.percent_complete == 100) { done = true; }
      });
      return true;
    }, {frequency: 0.3});
    return false;
  };

  var selectDown = function() {
    var selected = $('#results li.selected');
    if(selected.length > 0) {
      if(selected.next().length > 0) {
	selected.removeClass("selected");
	selected.next().addClass("selected");
	var index = selected.parent().children().index(selected); // position in list
	if(index > 0 && (index + 1) % 9 == 0) {
	  var selectedOffset = selected.offset().bottom;
	  console.log("scrolling to " + selectedOffset);
	  $("#results").animate({scrollTop: selectedOffset}, 1000);
	}
      }
    } else {
      // Search bar is currently selected
      $('#search').blur();
      $('#results li:first').addClass("selected");
    }
    return false;
  };

  var selectUp = function() {
    var selected = $('#results li.selected');
    if(selected.length > 0) {
      if(selected.prev().length > 0) {
	selected.removeClass("selected");
	selected.prev().addClass("selected");
	var index = selected.parent().children().index(selected); // position in list
	if((index + 1) % 9 == 0) {
	  if(index > 10) {
	    var selectedOffset = $("#results li:nth-child("+(index - 10)+")").offset().top;
	  } else {
	    var selectedOffset = 0;
	  }
	  console.log("scrolling to " + selectedOffset);
	  $("#results").animate({scrollTop: selectedOffset}, 1000);
	}
      } else {
	// Go to the search bar
	selected.removeClass("selected");
	$('#search').focus();
      }
    }
    return false;
  };

  var size_format = function(filesize) {
	if (filesize >= 1073741824) {
	     filesize = number_format(filesize / 1073741824, 2, '.', '') + ' GB';
	} else {
		if (filesize >= 1048576) {
     		filesize = number_format(filesize / 1048576, 2, '.', '') + ' MB';
   	} else {
			if (filesize >= 1024) {
    		filesize = number_format(filesize / 1024, 0) + ' KB';
  		} else {
    		filesize = number_format(filesize, 0) + ' B';
			};
 		};
	};
        return filesize;
  };

  var number_format = function( number, decimals, dec_point, thousands_sep ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     bugfix by: Michael White (http://crestidg.com)
    // +     bugfix by: Benjamin Lupton
    // +     bugfix by: Allan Jensen (http://www.winternet.no)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // *     example 1: number_format(1234.5678, 2, '.', '');
    // *     returns 1: 1234.57

    var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
    var d = dec_point == undefined ? "," : dec_point;
    var t = thousands_sep == undefined ? "." : thousands_sep, s = n < 0 ? "-" : "";
    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  };

  var query = $.getURLParam('q');
  $('title').text("Search for " + query);
  submitSearch(query);
  //$('#search_form').submit(submitSearch);
  //$('#submit').click(submitSearch);
  //$(document).bind('keydown', 'down', selectDown);
  //$(document).bind('keydown', 'up', selectUp);

});
