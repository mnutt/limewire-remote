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
 * @class Fabs.boombox.Track
 * @extends Ext.util.Observable
 * A class that represents a collection of tracks.
 * @constructor
 * @param {Object} config The config object or a string that will be used as the url of the track.
 */
Fabs.boombox.Track = Ext.extend( Ext.util.Observable, {
	
	/**
	 * @cfg {String} url The url of the mp3 to play
	 */
	url : '',
	
	/**
	 * @cfg {String} title The title to display
	 */
	title : '',
	
	/**
	 * @cfg {String} songname The name of the song.
	 */
	songname : '',
	
	/**
	 * @cfg {String} artist The name of the artist of the song
	 */
    artist : '',
	
	/**
	 * @cfg {Number} track The number of the track on the album.
	 */
	track : '',
	
	/**
	 * @cfg {String} album The name of the album the current track is on.
	 */
	album : '',
	
	/**
	 * @cfg {Number} year The year the of the track
	 */
	year : '',
	
	/**
	 * @cfg {Number} volume Volume level the track should play at (a number between 0 and 100)
	 */
	volume : 70,
	
	/**
	 * Read-only. Current position of the track.
	 * @type Number
	 */
	position: 0,
	
	/**
	 * @cfg {Boolean} autoLoad Immediately load this track during construction. If false, will wait
	 * until the object is played
	 */
    autoLoad : false,
	
	// private
	playing : false,
	
	// private
	started : false,
    
    constructor : function(config){
        
        if( typeof config == 'string' ){
            config = {url: config, name: ''};
        }
        
        Ext.apply(this, config);
        
        this.id = this.id || Fabs.boombox.generateTrackId();
        /**
		 * @event play
		 * Fires when the the underlying soundObject starts to play
		 * @param {Track} this
		 */
		/**
		 * @event pause
		 * Fires when the the underlying soundObject is paused
		 * @param {Track} this
		 */
		/**
		 * @event resume
		 * Fires when the the underlying soundObject resumes play
		 * @param {Track} this
		 */
		/**
		 * @event whileplaying
		 * Fires continuosly while the track is playing
		 * @param {Track} this
		 */
		/**
		 * @event beforefinish
		 * Fires when the the underlying soundObject is about to finish
		 * @param {Track} this
		 */
		/**
		 * @event justbeforefinish
		 * Fires when the the underlying soundObject is just about to finish (?)
		 * @param {Track} this
		 */
		/**
		 * @event beforefinishcomplete
		 * Fires when the the underlying soundObject is just about to complete finish (??)
		 * @param {Track} this
		 */
		/**
		 * @event finish
		 * Fires when the the underlying soundObject finishes
		 * @param {Track} this
		 */
		/**
		 * @event id3
		 * Fires when the the underlying soundObject's id3 information is loaded
		 * @param {Track} this
		 */
        this.addEvents.apply(this,Fabs.boombox.smSoundEvents);
		this.addEvents(
			/**
			 * @event stop
			 * Fires when the track is stopped
			 * @param {Track} this
			 */
			'stop',
			
			/**
			 * @event loaderror
			 * Fires when the track does not load correctly
			 * @param {Track} this
			 */
			'loaderror',
			
			/**
			 * @event infochange
			 * Fires when the track information is changed
			 * @param {Track} this
			 */
			'infochange',
			
			/**
			 * @event infochange
			 * Fires when the track playing state is changed
			 * @param {Track} this
			 */
			'statechange'
		);
		this.addEvents('ready');
        
        Fabs.boombox.Track.superclass.constructor.call(this);
		
		this.id3 = false;
        
        // listen to our own events
        this.on('id3', this.onID3, this);
		this.on('load', this.onLoad, this);
		this.on('whileplaying', this.onWhilePlaying, this);
		this.on('play', this.onPlay, this);
		this.on('resume', this.onResume, this);
		this.on('pause', this.onPause, this);
		this.on('finish', this.onFinish, this);
        
		this.loaded = false;
		this.ready = false;
		this.playing = false;
		this.started = false;
		
        if( this.autoLoad ){
            this.load();
        }
        
    },
	
	// private
	fireOnReady : function(){
		this.ready = true;
		this.fireEvent('ready', this);
	},
	
	/**
	 * This function allows you to call methods on the underlying soundObject when
	 * it is loaded and ready
	 * @param {Function} callback Function to call when ready
	 * @param {Object} scope (optional) Scope to apply the function to
	 */
	onReady : function(fn, scope){
		if( !this.ready ){
			this.on('ready', fn, scope);
			if (!this.loaded) {
				this.load();
			}
		}
		else{
			fn.apply(scope,[this]);
		}
	},
	
	getProgressPercent : function(){
		var p = 0;
		if( this.soundObject){
			p = this.position/(this.soundObject.readyState==3?this.soundObject.duration:this.soundObject.durationEstimate) * 100;
		}
		return p;
	},
	
	setProgressByPercent : function(p){
		if( this.soundObject ){
			p = p/100 * (this.soundObject.readyState==3?this.soundObject.duration:this.soundObject.durationEstimate);
			this.soundObject.setPosition( p );
			this.position = p;
			
		}
	},
    
    load : function(callback, scope){
		if( this.loaded ){ return false; }
		var cfg = {
            id                      :this.id,
            url                     :this.url,
            autoLoad                :this.autoLoad || false,
            autoPlay                :this.autoPlay || false
        };
        Ext.each(Fabs.boombox.smSoundEvents, function(ev){
			var name = ev.indexOf('while') === 0 ? ev : 'on'+ev;
            cfg[name] = this.handleSMEvent.createDelegate(this,[ev],0);
        }, this);
		Fabs.boombox.onSoundManagerReady( function(){
			this.soundObject = soundManager.createSound(cfg);
			this.soundObject.setVolume(this.volume);
			this.loaded = true;
			this.fireOnReady();
		}, this);
		return true;
    },
	
	/**
	 * Returns whether the track is playing or not
	 * @return {Boolean} playing
	 */
	isPlaying : function(){
		return this.playing;
	},
	
	/**
	 * Returns whether the track has information yet
	 * @param {Array} fields An array of strings representing the desired fields
	 * @return {Boolean} hasSongInfo
	 */
	hasSongInfo : function(){
		var songInfo = true;
		Ext.each(arguments || ['songname','artist'], function(field){
			if( !this[field] || this[field] == '' ){
				songInfo = false;
				return false;
			}
			return true;
		}, this);
		return songInfo;
	},
	
	/**
	 * Start playing the track
	 * @return {Track} this
	 */
	play : function(){
		this.onReady(function(){
			this.soundObject[this.started?'resume':'play']();
		}, this);
		return this;
	},
	
	/**
	 * Pause the track
	 * @return {Track} this
	 */
	pause : function(){
		if( this.playing && this.soundObject ){
			this.soundObject.pause();
		}
		return this;
	},
	
	/**
	 * Stop the track. This resets the position to the beginning.
	 * @return {Track} this
	 */
	stop : function(){
		if( this.soundObject ){
			this.soundObject.stop();
			// need to fire a stop event here because it does not fire
			// automatically from the soundObject
			this.started = false;
			this.playing = false;
			this.position = 0;
			this.fireEvent('stop', this);
			this.fireEvent('statechange', this);
			this.fireEvent('positionchange', this);
		}
		return this;
	},
	
	/**
	 * Set the volume for this track.
	 * @param {Number} level A number between 0 and 100
	 * @return {Track} this
	 */
	setVolume : function(level){
		this.volume = level;
		this.onReady(function(){
			this.soundObject.setVolume(level);
		}, this);
		return this;
	},
	
    // private
    handleSMEvent : function(ev){
		var args = Array.prototype.slice.apply(arguments,[0]);
		args.splice(1,0,this);
        this.fireEvent.apply(this, args);
    },
    
	/**
	 * Unload the current tracks underlying soundObject
	 */
    unload : function(){
        if( this.soundObject ){
            soundManager.destroySound( this.id );
        }
    },
	
	// private
	onWhilePlaying : function(){
		this.position = this.soundObject.position;
		this.fireEvent('positionchange', this);
	},
    
	// private
    onID3 : function(id3){
        this.id3 = this.soundObject.id3;
		var props = ['songname','artist','album','track','year'];
		Ext.each(props, function(prop){
			if( this[prop] == "" ){
				this[prop] = this.id3[prop] || '';
			}
		}, this);
		if( !this.title && this.songname && this.artist ){
			this.title = this.artist+' - '+this.songname;
		}
		this.fireEvent("infochange", this);
    },
	
	// private
	onPlay : function(){
		this.started = true;
		this.playing = true;
		this.fireEvent('statechange', this);
	},
	
	// private
	onResume : function(){
		this.started = true;
		this.playing = true;
		this.fireEvent('statechange', this);
	},
	
	// private
	onPause : function(){
		this.playing = false;
		this.fireEvent('statechange', this);
	},
	
	// private
	onFinish : function(){
		this.started = false;
		this.playing = false;
		this.fireEvent('statechange', this);
	},
	
	// private
	onLoad : function(){
		if( this.soundObject.readyState === 2 ){
			this.loadError = true;
			this.loaded = false;
			this.ready = false;
			soundManager.destroySound(this.id);
			delete( this.soundObject );
			this.fireEvent('loaderror', this);
		}
	}
    
});