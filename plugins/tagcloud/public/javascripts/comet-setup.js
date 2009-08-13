var cometURL = document.location.protocol + '//' + document.location.hostname + ':' + document.location.port + '/comet';
$.cometd.init(cometURL);


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

var time_format = function( number ) {
  number = parseInt(number);
  var minutes = parseInt(number / 60);
  var seconds = parseInt(number % 60);
  if(seconds < 10) { seconds = "0"+seconds; }
  return minutes + ":" + seconds;
};