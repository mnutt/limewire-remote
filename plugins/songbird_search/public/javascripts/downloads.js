$(document).ready(function() {
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

  $.periodic(function(controller) {
    $.getJSON("/downloads", function(downloads) {
      for(var i in downloads) {
	var download = downloads[i];
	var existing = $('#'+download.sha1);
	if(existing.length > 0) {
	  var row = existing;
	} else {
	  $('#downloads treechildren').addXULRow(["title", "size", "speed", "done", "eta"], download.sha1);
	  var row = $('#'+download.sha1);
	}
	row.updateXULValues({ title: download.title,
			      size: size_format(download.total_size),
			      speed: download.download_speed,
			      done: download.percent_complete,
			      eta: download.time_remaining });
      }
    });
    return true;
  }, {frequency: 0.5});
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

