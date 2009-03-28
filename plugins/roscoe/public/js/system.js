jQuery.system = {
    init : function() {
        jQuery(".hover").hover(
            function(){jQuery(this).addClass("hover_on");},
            function(){jQuery(this).removeClass("hover_on").removeClass("down_on");}
        ).mousedown(function(){
            jQuery(this).addClass("down_on");
        });
    },
    log : function(msg) {
        (window.console) ? console.debug(msg) : alert(msg);
    },
    setConnection : function(num) {
        var connection_types = new Array();
        connection_types[0] = ["no_bars", "No Bars"];
        connection_types[1] = ["weak", "Weak Connection"];
        connection_types[2] = ["medium", "Medium Connection"];
        connection_types[3] = ["strong", "Strong Connection"];
        connection_types[4] = ["fail", "Failed Connection"];
        connection_types[5] = ["no_network", "No Network Connection"];
        jQuery("#connection_bars").removeClass().addClass(connection_types[num][0]).text(connection_types[num][1]);
    }
};

jQuery.fn.dropdown = function(value, options) {
    options = jQuery.extend({
        button: "span.button",
        dropdown: ".dropdown"
    }, options);

    value = jQuery(value);
    var button = this.find(options.button + ":first");
    var dropdown = this.find(options.dropdown + ":first");
    var body = jQuery("body");
    var overlay = null;
    var overlaySet = false;

    button.click(function(){
        dropdown.show();
        body.append("<div id=\"overlay\"></div>");
        overlay = jQuery("#overlay");
        overlay.click(function(){
            dropdown.hide();
            jQuery(this).remove();
        });
        overlaySet = true;
    });

    dropdown.find("li a").click(function(e){
        var text = jQuery(this).text();
        button.children("span").text(text).removeClass().addClass(jQuery(this).attr("class"));
        value.val(text);
        dropdown.hide();
        overlay.remove();
        overlaySet = false;
        e.preventDefault();
    });
    return(this);
};

jQuery.fn.inputDefaultText = function(value, options) {
    options = jQuery.extend({
        blurColor: "#808080",
        focusColor: "#313131"
    }, options);

    var defaultTxt = this.parent().find("label[for='" + this.attr("name") + "']").text();

    this.val(defaultTxt).css("color", options.blurColor);
    this.focus(function(){
        jQuery(this).val("").css("color", options.focusColor);
    });
    this.blur(function(){
        if (jQuery(this).val() == "") {
            jQuery(this).val(defaultTxt).css("color", options.blurColor);
        }
    });
    return(this);
};

$(document).ready(function(){
    // Init
    $.system.init();
    $.system.setConnection(3);
    $("#search_type_dropdown").dropdown("#search_type");
    $("#search_txtbox").inputDefaultText();
    $("#filter").inputDefaultText();
    
    $("#file_filter a").click(function(e){
        e.preventDefault();
        if (!$(this).hasClass("selected")) {
            $(this).parents().find("a.selected").removeClass("selected");
            $(this).addClass("selected");
        }
    });
});