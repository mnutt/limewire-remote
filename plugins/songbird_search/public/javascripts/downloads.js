$(document).ready(function() {
  $.cometd.subscribe('/download', this, updateDownload);
});

$.fn.addXULRow = function(labels, id) {
  var treeRow = $(document.createElement('treerow'));
  var treeItem = $(document.createElement('treeitem'));
  treeItem.attr('id', id);
  treeItem.append(treeRow);
  treeRow.append($(document.createElement('treecell')).attr('label', ' '));
  for(var i in labels) {
    var treeCell = $(document.createElement('treecell')).addClass(labels[i]);
    if(labels[i] == "done") { treeCell.attr('mode', 'normal'); }
    treeRow.append(treeCell);
  }
  $(this).append(treeItem);
};

$.fn.updateXULValues = function(values) {
  for(key in values) {
    if(key == "done") {
      $(this).find('.'+key).attr('value', values[key]);
    } else {
      $(this).find('.'+key).attr('label', values[key]);
    }
  }
};

var pollForDownload = function(sha1) {
  $.cometd.publish('/download', sha1);
  return;
};

var updateDownload = function(download) {
  $('#downloads').show();
  if(download.data && download.data.sha1 && download.data.state != "removed") {
    download = download.data;
  } else {
    return false;
  }
  var existing = $('#downloads').find('#'+download.sha1);
  if(existing.length > 0) {
    var row = existing;
  } else {
    $('#downloads treechildren').addXULRow(["title", "state", "size", "speed", "done", "eta"], download.sha1);
    var row = $('#downloads #'+download.sha1);
  }

  // If the download isn't complete, continue updating
  if(parseInt(download.percent_complete) < 100) {
    setTimeout("pollForDownload('" + download.sha1 + "');", 300);
  } else {
    $('#results #'+download.sha1+' .from').attr("label", "Library");
  }

  if(!download.remaining_time || download.remaining_time > 2000000) {
    download.remaining_time = "\u221E"; // Infinity
  } else {
    download.remaining_time = download.remaining_time + " sec";
  }

  if(!download.title) { download.title = download.file_name; }
  row.updateXULValues({ title: download.title,
			state: download.state.toLowerCase(),
                        size: size_format(download.complete) + " / " + size_format(download.total_size),
	     	        speed: size_format(download.download_speed * 1000) + "/s",
		        done: "" + download.percent_complete,
			eta: "" + download.remaining_time });
};