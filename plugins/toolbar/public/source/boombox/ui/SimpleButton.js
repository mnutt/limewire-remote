/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */

Ext.namespace('Fabs.boombox.ui');
/*
 * Fab's BoomBox Version 1.0
 * Copyright(c) 2009, Owl Watch Consulting Serivces, LLC
 * support@owlwatch.com
 * 
 * MIT License
 */

/**
 * @class Fabs.boombox.ui.SimpleButton
 * @extends Ext.util.Observable
 * A simple button for a page
 * @constructor
 * @param {Object} config The config object
 */
Fabs.boombox.ui.SimpleButton = Ext.extend( Ext.util.Observable, {
    
    /**
     * @cfg {String} url Url of the track to play
     */
    url : '',
    
    /**
     * @cfg {String} align Alignment for the button
     */
    align : 'left',
    
    /**
     * @cfg {Number} volume A number between 0 and 100 (defaults to 90)
     */
    volume : 90,
    
    /**
     * @cfg {String/HTMLElement/Element} renderTo The element to render this to
     */
    
    /**
     * @cfg {Boolean} autoPlay Start playing this immediately upon load?
     */
    
    constructor : function(cfg){
        Ext.apply(this,cfg);
        Fabs.boombox.ui.SimpleButton.superclass.constructor.call(this);
        this.track = new Fabs.boombox.Track({url: this.url});
        this.track.setVolume(this.volume);
        this.track.on('play', this.onPlaying, this);
        this.track.on('resume', this.onPlaying, this);
        this.track.on('pause', this.onNotPlaying, this);
        this.track.on('stop', this.onNotPlaying, this);
        this.track.on('finish', this.onFinish, this);
        if( this.renderTo ){
            this.render(this.renderTo);
        }
        if( this.autoPlay ){
            this.track.play();
        }
    },
    
    /**
     * Render the button
     * @param {String/HTMLElement/Element} el The element, or id of element, to render to
     */
    render : function(el){
        this.el = Ext.get(el);
        this.el.update('');
        this.el.addClass('simple-button');
        this.el.on('click', this.onClick, this);
    },
    
    onPlaying : function(){
        this.el.addClass('simple-button-playing');
    },
    
    onNotPlaying : function(){
        this.el.removeClass('simple-button-playing');
    },
    
    onFinish : function(){
        this.track.stop();
    },
    
    onClick : function(e){
        e.stopEvent();
        this.track[this.track.isPlaying()?'pause':'play']();
    }
    
});

/**
 * Static function to scan a page for links and create buttons
 * out of them
 * @param {String} selector The CSS selector to look for
 * @param {Object} defaultCfg The default config for the created buttons
 * @static
 */
Fabs.boombox.ui.SimpleButton.create = function(selector, defaultCfg){
    Ext.onReady( function(){
        Ext.select( selector ).each( function(el){
            var cfg = {renderTo:el, url:el.dom.href};
            new Fabs.boombox.ui.SimpleButton(Ext.apply(defaultCfg||{},cfg));
        });
    });
};