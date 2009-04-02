(function($){

    // global variables
   var SHA1Map = new Array();
   var mapID = 0;
   var list = null;

    // plugin definition
    jQuery.search = function(options){
        list = $("ul#search_results");

        settings = jQuery.extend({
            term: "test",
            list: "search_results"
        }, options);


        jQuery.getJSON("/search/q/"+settings.term, pollForResults);
    };

    function pollForResults(query){
        var guid = query.guid;
      $.periodic(function(controller) {
        jQuery.getJSON("/search/"+guid+"/results", resultManager);
	return true;
      }, {frequency: 5});
    };

    function resultManager(data){
        // TODO: check for EOS (end of search)
        // TODO: check for no results and set timer
        checkSHA1Map(data);
    }
    function checkSHA1Map(data){
        jQuery.each(data.results, function(i, item){
            if (!SHA1Map[item.sha1]) {
                SHA1Map[item.sha1] = mapID;
                mapID +=1;
                addResult(item, SHA1Map[item.sha1]);
            } else {
                addSimilarResult(item, SHA1Map[item.sha1]);
            }
        });
    };

    function addResult(result, id){
        html = '<li class="audio clearfix res-' + id + '"><div class="col1"><h2><a href="' + result.sha1 + '">' + result.filename + '</a></h2><p>' + result.properties.QUALITY + '</p></div><div class="col3"><a class="btn_info hover" href="">More Info</a></div></li>';
        list.append(html);
    };

    function addSimilarResult(result, id){
        html = '<li class="similar audio clearfix sim-' + id + '"><div class="col1"><h2><a href="' + result.SHA1 + '">' + result.filename + '</a></h2><p>' + result.properties.QUALITY + '</p></div><div class="col3"><a class="btn_info hover" href="">More Info</a></div></li>';
        var parent = list.children("li.res-" + id);
        parent.after(html);
        if (!parent.hasClass("sim")) {
            addSimilarButton(parent);
        }
    };

    function sortResults(){
        // TODO: call sort after each json pull, then pull getResults(resultManager)?
    };

    function addSimilarButton(el){
        var img = '<a class="btn_similar hover" href="">Similar Results</a>';
        el.addClass("sim").children("div.col3").append(img);
    };

   jQuery(".btn_similar").live("click", function(e) {
     var parent = jQuery(this).parents("li");
     if (!parent.hasClass("expanded")) {
       parent.addClass("expanded");
       parent.siblings("li.similar").show();
     } else {
       parent.removeClass("expanded");
       parent.siblings("li.similar").hide();
     }
     e.preventDefault();
   });

})(jQuery);

$(document).ready(function(){
    $.search();
});