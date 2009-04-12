jQuery(document).ready(function(){
  var queryCache = null;
  var guidCache = null;

  var liveTyping = function() {
    var searchField = $('#search');
    var typing = false;

    $.periodic(function(controller) {
      if(typing != true) {
	$.getJSON('/live_search/get_query', function(json) {
	  if(json.query != queryCache) {
	    console.log("something changed...");
	    searchField.attr({value: json.query});
	    queryCache = json.query;
	  }
	  if(json.guid && guidCache != json.guid) {
	    getResultsForGuid(json.guid);
	    guidCache = json.guid;
	  }
	});
      }
      return false;
    }, {frequency: 0.5});

    searchField.keyup(function(event) {
      queryCache = searchField.attr('value');
      $.post('/live_search/set_query',
	     { query: searchField.attr('value'),
               authenticity_token: $('input[name=authenticity_token]').val() },
	     function() { console.log("done"); typing = false; });
    });

    searchField.keydown(function(event) {
      typing = true;
    });
  };

  var submitSearch = function() {
    $.postJSON('/search/' + $('#search').val(), function(search) {
      guid = search.guid;
      getResultsForGuid(guid);
      $.post('/live_search/set_query',
             { guid: search.guid,
	       authenticity_token: $('input[name=authenticity_token]').val() }
      );
    });
    return false;
  };

  var getResultsForGuid = function(guid) {
    $('#results').html('');
    $('#results').before("<input type='hidden' name='guid' value='"+guid+"'>");
    times_refreshed = 0;
    _loadingSearch = false;
    $.periodic(function(controller) {
      if(_loadingSearch) { _loadingSearch = false; return true; }
      if(times_refreshed && times_refreshed > 20) { controller.stop(); }

      _loadingSearch = true;
      times_refreshed ? times_refreshed++ : times_refreshed = 1;

      $.getJSON("/search/" + guid, function(realData) {
	results = eval(realData).results;
	if(results.length > 0) { $("#loading").hide(); }

	$.each(results, function(index, result) {
	  if($('#'+result.sha1).length == 0) {
	    item =  "<li class='result' id="+result.sha1+">";
	    item += "  <div class='filename'>"+result.filename+"</div>";
	    item += "  <div class='percent'></div>";
	    item += "  <div class='progress'></div>";
	    item += "</li>";
	    $('#results').append(item);
	    if(index == 0) { $("#results li:first").addClass("selected"); }
	    $('#results li:last').click(startDownload);
	  }
	  if($('#results li').length > 50) {
	    controller.stop();
	  }
	});

	_loadingSearch = false;
      });
      return true;
    }, {frequency: 1});
  };

  var startDownload = function(ev) {
    li = $(ev.target).parent();
    li.addClass("downloading");
    urn = li.attr('id');
    guid = $("#results input[name=guid]").val();
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
    selected = $('#results li.selected');
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
    selected = $('#results li.selected');
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

  liveTyping();
  $('#search_form').submit(submitSearch);
  $('#submit').click(submitSearch);
  $(document).bind('keydown', 'down', selectDown);
  $(document).bind('keydown', 'up', selectUp);
});
