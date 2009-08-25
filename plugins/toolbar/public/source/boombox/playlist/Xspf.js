/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */

Ext.namespace('Fabs.boombox.playlist');
/*
 * Fab's BoomBox Version 1.0
 * Copyright(c) 2009, Owl Watch Consulting Serivces, LLC
 * support@owlwatch.com
 * 
 * MIT License
 */

/**
 * @class Fabs.boombox.playlist.Xspf
 * @extends Fabs.boombox.Playlist
 * A playlist representing an xspf document
 * @constructor
 * @param {Object} config The config object
 */
Fabs.boombox.playlist.Xspf = Ext.extend( Fabs.boombox.Playlist, {
    
	/**
	 * @cfg {String} url The url of the xspf
	 */
	
	/**
	 * @cfg {XMLElement} xml The xml element of the xspf
	 */
	
	constructor : function(cfg){
		if( typeof cfg == 'string'){
			cfg = {url:cfg};
		}
        Fabs.boombox.playlist.Xspf.superclass.constructor.apply(this,arguments);
        if( this.url ){
            this.loadUrl(this.url);
        }
        else if( this.xml ){
            this.loadXML(this.xml);
        }
    },
    
	/**
	 * Load a url
	 * @param {String} url The url of the xspf
	 */
    loadUrl : function(url){
        Ext.Ajax.request({
            url             :url,
            scope           :this,
            success         :this.onRequestSuccess,
            failure         :this.onRequestFailure
        });
    },
    
    onRequestSuccess : function(response){
        this.loadXML(response.responseXML);
    },
    
    onRequestFailure : function(response){
        // uh-oh.
    },
    
	/**
	 * Load the xml of the podcast
	 * @param {XMLElement} xml The xml element of the xspf
	 */
    loadXML : function(doc){
        this.clear();
		var root = doc.documentElement || doc;
    	var q = Ext.DomQuery, songname='', artist='', title='', tracks=[], annotation;
		// ok, lets go through this bad boy.
		Ext.each( q.select('trackList track', root), function(track){
			annotation = q.selectValue('annotation', track);
            songname = q.selectValue('title', track);
			artist = q.selectValue('creator', track);
			title = artist+' - '+songname;
			if( annotation && (!songname || !artist) ){
				title = annotation;
			}
			tracks[tracks.length] = {
				url				:q.selectValue('location',track),
                title			:title,
				songname		:songname,
				artist			:artist
			};
		}, this);
		this.addTracks(tracks);
    }
});