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
 * @class Fabs.boombox.playlist.Podcast
 * @extends Fabs.boombox.Playlist
 * A playlist representing a podcast
 * @constructor
 * @param {Object} config The config object
 */
Fabs.boombox.playlist.Podcast = Ext.extend( Fabs.boombox.Playlist, {
    
	/**
	 * @cfg {String} url The url of the podcast
	 */
	
	/**
	 * @cfg {XMLElement} xml The xml element of the podcast
	 */
	
	constructor : function(cfg){
		if( typeof cfg == 'string'){
			cfg = {url:cfg};
		}
        Fabs.boombox.playlist.Podcast.superclass.constructor.apply(this,arguments);
        if( this.url ){
            this.loadUrl(this.url);
        }
        else if( this.xml ){
            this.loadXML(this.xml);
        }
    },
    
	/**
	 * Load a url
	 * @param {String} url The url of the podcast
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
	 * @param {XMLElement} xml The xml element of the podcast
	 */
    loadXML : function(doc){
		var root = doc.documentElement || doc;
        this.clear();
    	var q = Ext.DomQuery, songname='', artist='',tracks=[];
		// ok, lets go through this bad boy.
		Ext.each(q.select('channel item', root), function(item){
            var title= q.selectValue('title',item);
			tracks[tracks.length] = {
				url				:q.selectValue('link',item),
                title			:title
			};
		}, this);
		this.addTracks(tracks);
    }
});