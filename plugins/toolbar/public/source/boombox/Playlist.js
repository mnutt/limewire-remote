/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */

/*
 * Fab's BoomBox Version 1.0
 * Copyright(c) 2009, Owl Watch Consulting Serivces, LLC
 * support@owlwatch.com
 * 
 * MIT License
 */

/**
 * @class Fabs.boombox.Playlist
 * @extends Ext.util.Observable
 * A class that represents a collection of tracks.
 * @constructor
 * @param {Object} config The config object
 */
Fabs.boombox.Playlist = Ext.extend( Ext.util.Observable, {
	
	// private
	index : -1,
	
	// private
	history : null,
	
	// private
	tracks : null,
	
	// private
	remaining : [],
    
    constructor : function(config){
		
        if( Ext.isArray('array') ){
            config = {tracks: config};
        }
        
        this.addEvents.apply(this,Fabs.boombox.smSoundEvents);
		this.addEvents({
			/**
			 * @event trackpositionchange
			 * @Fires when a track's position changes
			 * @param {Track} track
			 */
			/**
             * @event trackadded
             * Fires when the a track is added
             * @param {Track} track
             * @param {Playlist} this
             */
			'trackadded'			:true,
			/**
             * @event trackremoved
             * Fires when the a track is removed
             * @param {Track} track
             * @param {Playlist} this
             */
			'trackremoved'			:true,
			/**
             * @event trackloaderror
             * Fires when the a track does not load correctly
             * @param {Track} track
             * @param {Playlist} this
             */
			'trackloaderror'				:true
			
		});
		
        Ext.apply(this, config);
        
		this.history = new Fabs.util.Hash();
		this.remaining = [];
		
        if( this.tracks && this.tracks.length > 0  ){
            var t = this.tracks.slice(0);
			this.tracks = new Fabs.util.Hash();
			this.addTracks(t);
        }
		else{
			this.tracks = new Fabs.util.Hash();
		}
		this.on('trackplay', this.onTrackPlay, this);
		this.on('trackloaderror', this.onTrackLoadError, this);
        
        Fabs.boombox.Playlist.superclass.constructor.call(this);
		
    },
	
	clear : function(){
		// should actually call removetrack for each track, but we'll get to that later
		this.tracks.clear();
		this.history.clear();
	},
	
	/**
	 * Adds an array of tracks to the playlist
	 * @param {Array} tracks Tracks to be added
	 */
	addTracks : function(tracks){
		Ext.each(tracks, function(track, index){
			this.addTrack(track, index==tracks.length-1);
		},this);
	},
    
	/**
	 * Adds an track to the current playlist
	 * @param {Object/Track} track A config object for a Track, or an instance of a Track object
	 */
    addTrack : function(track, isLast){
		if( typeof isLast == 'undefined'){
			isLast = true;
		}
		if( typeof track == 'string' ){
			track = {url:track};
		}
		if( !track.addEvents ){
			track = Ext.apply({
				autoLoad				:this.autoLoad
			}, track);
			track = new Fabs.boombox.Track(track);
		}
		var events = Fabs.boombox.smSoundEvents.slice(0);
		events.splice(0,0,'stop','positionchange','loaderror');
        this._relayTrackEvents(track,events);
		this.tracks.add(track.id, track);
		this.fireEvent('trackadded', track, isLast, this);
    },
    
	// private
    _relayTrackEvents : function(o, events){
        var createHandler = function(ename){
            return function(){
				var args = Array.prototype.slice.call(arguments, 0);
				args.splice(0,0,ename);
                return this.fireEvent.apply(this, args);
            };
        };
        for(var i = 0, len = events.length; i < len; i++){
            var ename = events[i];
            if(!this.events[ename]){ this.events[ename] = true; }
			o.on(ename, createHandler('track'+ename), this);
        }
    },
	
	/**
	 * Returns the next track, but does not immediately update the playlist index
	 * @param {Boolean} shuffle (optional) If shuffle is true, will return a
	 * random track from the tracks that have yet to be played in the playlist
	 */
	getNext : function(shuffle){
		if( shuffle ){
			var tmp = [];
			if(this.history.getLength() < this.tracks.getLength()){
				this.tracks.each( function(track){
					if(!track.loadError && this.history.indexOf(track) == -1 ){
						tmp[tmp.length] = track;
					}
				}, this);
				if( tmp.length == 0 && this.history.getLength() > 0 ){
					tmp = this.history.asArray();
					this.history.clear();
				}
			}
			else{
				this.history.clear();
				tmp = this.tracks.asArray();
			}
			var tmpIndex = parseInt(Math.round(Math.random()*(tmp.length-1)),10);
			return tmp[tmpIndex];
		}
		else{
			this.index++;
			if( this.index > this.tracks.getLength()-1 ){
				this.index = 0;
			}
			return this.tracks.getAt(this.index);
		}
	},
	
	// private
	onTrackPlay : function(track){
		this.history.add(track.id, track);
		this.index = this.tracks.indexOf(track);
	},
	
	// private
	onTrackLoadError : function(track){
		return this.tracks.remove(track);
	}
    
});
