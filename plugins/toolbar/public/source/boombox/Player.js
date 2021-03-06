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
 * @class Fabs.boombox.Player
 * @extends Ext.util.Observable
 * A class that represents the underlying music player.
 * @constructor
 * @param {Object} config The config object
 */
Fabs.boombox.Player = Ext.extend( Ext.util.Observable, {
    
	/**
	 * Read-only. Array of playlists
	 * @type Array
	 */
    playlists : [],
	
	/**
	 * Read-only. Index of current playing track in history
	 * @type Array
	 */
	index : -1,
	
	/**
	 * Read-only. History of tracks played
	 * @type Array
	 */
	history : [],
	
	activePlaylistIndex : -1,
	
	/**
     * @cfg {Boolean} autoPlay
     * Automatically start tracks when added (defaults to false)
     */
	autoPlay : false,
	
	/**
     * @cfg {Boolean} shuffle
     * Enable shuffled play (defaults to false)
     */
	shuffle : false,
	
	/**
	 * @cfg {Number} volume
	 * The initial volume level (Defaults to 80)
	 */
	volume : 80,
	
	// private
	nextTrack : null,
	
	/**
	 * Read-only. The reference to the currently playing track
	 * @type Fabs.boombox.Track
	 */
	currentTrack : null,
	
	// private
	autoPlayFlag : false,
    
    constructor : function(config){
		
        this.addEvents({
			/**
             * @event play
             * Fires when the state of player is playing (a track is played or resumed)
             * @param {Player} this
             */
            'play'        		:true,
			
			/**
             * @event pause
             * Fires when the player is paused
             * @param {Player} this
             */
            'pause'             :true,
			
			/**
             * @event statechange
             * Fires when the player's state is altered (playing/paused)
             * @param {Player} this
             */
			'statechange'		:true,
			
			/**
			 * @event trackchange
			 * Fires when a track is loaded / added to the player
			 * @param {Player} this
			 * @param {Track} track
			 */
			
			/**
             * @event play
             * Fires when a playlist is added to the player
             * @param {Playlist} this
             */
			'playlistadded'		:true
        });
        
        Ext.apply(this,config);
        
        this.init();
		
		Fabs.boombox.Player.superclass.constructor.call(this);
		
		this.history = [];
		
		this.on('playlistadded', this.onPlaylistAdded, this);
                
		if( this.playlist ){
			this.addPlaylist(this.playlist);
			delete this.playlist;
		}
		else{
			var playlist = new Fabs.boombox.Playlist(Ext.apply(this.playlistCfg||{},{
				autoLoad				:this.autoLoad
			}));
			this.addPlaylist(playlist);
			if (this.tracks) {
				playlist.addTracks(this.tracks.slice(0));
				delete this.tracks;
			}
        }
		
    },
	/**
     * Add a playlist to the player
     * @param {Playlist} playlist This is a valid playlist object
     */
	addPlaylist : function(playlist){
		this.playlists[this.playlists.length] = playlist;
		playlist.on('trackadded', this.onPlaylistTrackAdded, this);
		playlist.on('trackplay', this.onPlaylistTrackPlay, this);
		playlist.on('trackstop', this.onPlaylistTrackStop, this);
		playlist.on('trackpause', this.onPlaylistTrackPause, this);
		playlist.on('trackresume', this.onPlaylistTrackResume, this);
		playlist.on('trackload', this.onPlaylistTrackLoad, this);
		playlist.on('trackfinish', this.onPlaylistTrackFinish, this);
		playlist.on('trackloaderror', this.onPlaylistTrackLoadError, this);
		this.fireEvent('playlistadded', playlist);
	},
	
	// private
	onPlaylistTrackPlay : function(track){
		if( !this.currentTrack || track != this.currentTrack ){
			if( this.currentTrack ){
				this.currentTrack.stop();
			}
			this.currentTrack = track;
			this.fireEvent('statechange', this);
			this.fireEvent('trackchange', this, track);
		}
		if( track.id3 ){
			this.updateTrackInfo(track);
		}
		else{
			//Ext.fly('track').update('Loading ID3...');
			track.on('id3', this.updateTrackInfo, this);
		}
		track.setVolume(this.volume);
		this.fireEvent('statechange', this);
	},
	
	// private
	onPlaylistTrackPause : function(track){
		this.fireEvent('statechange', this);
	},
	
	// private
	onPlaylistTrackStop: function(track){
		this.fireEvent('statechange', this);
	},
	
	// private
	onPlaylistTrackResume : function(track){
		this.autoPlayFlag = false;
		track.setVolume(this.volume);
		this.fireEvent('statechange', this);
	},
	
	// private - for debugging right now
	updateTrackInfo : function(track){
		// Ext.fly('track').update(track.id3.track+'. '+track.id3.artist+' - '+track.id3.songname);
	},
	
	// private
	onPlaylistTrackFinish : function(){
		this.next();
		this.fireEvent('statechange', this);
	},
	
	// private
	onPlaylistAdded : function(playlist){
		if( this.activePlaylistIndex == -1 ){
			this.activePlaylistIndex = 0;
		}
	},
	
	// private
	onPlaylistTrackAdded : function(track, isLast, playlist){
		/*
		if( !this.isPlaying() && this.autoPlay && !this.autoPlayFlag){
			this.autoPlayFlag = true;
			track.play();
		}
		*/
		if( isLast && !this.isPlaying() && this.autoPlay ){
			this.getNextTrack().play();
			this.autoPlay = false;
		}
	},
	
	// private
	onPlaylistTrackLoadError : function(track){
		this.next();
	},
	
	/**
     * Play the current track
     * @param {Track} track (optional) A reference to a track to play
     */
	play : function(track){
		if( !this.currentTrack && !track ){
			this.updateCurrentTrack();
		}
		if( track && track != this.currentTrack ){
			if( this.currentTrack ){
				this.currentTrack.stop();
			}
			this.index = this.history.length;
			this.history[this.index] = this.currentTrack = track;
			this.fireEvent("trackchange", this, track);
		}
		if( this.currentTrack ){
			this.currentTrack.play();
			this.playing = true;
		}
	},
	
	/**
	 * Toggle the play state of the current track, if available
	 */
	togglePlay : function(){
		if( this.isPlaying() ){
			this.pause();
		}
		else{
			this.play();
		}
	},
	
	/**
	 * Toggle the shuffle state of the player
	 */
	toggleShuffle : function(){
		this.shuffle = !this.shuffle;
		this.fireEvent('statechange',this);
	},
	
	/**
     * Advance to the next track
     */
	next : function(){
		this.updateCurrentTrack();
		if( this.currentTrack ){
			this.currentTrack.play();
		}
	},
	
	/**
     * Play the previous track in history
     */
	prev : function(){
		if( this.index > 0 && this.index - 1  < this.history.length ){
			if( this.currentTrack ){
				this.currentTrack.stop();
			}
			this.index--;
			this.currentTrack = this.history[this.index];
			this.fireEvent('trackchange', this, this.currentTrack );
			this.currentTrack.play();
		}
	},
	
	// private
	updateCurrentTrack : function(){
		if( this.currentTrack ){
			/**
			 * Need to destroy the sound object here.
			 */
			this.currentTrack.stop();
			// this.currentTrack.destroySoundObject();
		}
		if( this.index < this.history.length-1 && this.index > -1){
			this.index++;
			this.currentTrack = this.history[this.index];
		}
		else{
			this.index = this.history.length;
			this.history[this.index] = this.currentTrack = this.getNextTrack();
		}
		if( this.currentTrack ){
			this.fireEvent('trackchange', this, this.currentTrack );
		}
	},
	
	// private
	getNextTrack : function(){
		var pl = this.getPlaylist();
		return pl ? pl.getNext(this.shuffle) : null;
	},
	
	/**
     * Returns whether or not this player is currently playing
     * @return {Boolean} playing
     */
	isPlaying : function(){
		return this.currentTrack && this.currentTrack.isPlaying();
	},
	
	/**
	 * Pause the player's current track
	 */
	pause : function(){
		if( this.isPlaying() ){
			this.currentTrack.pause();
			this.playing = false;
		}
	},
	
	/**
     * Stop the player (moves the cursor to the beginning of the track)
     */
	stop : function(){
		if( this.currentTrack ){
			this.currentTrack.stop();
		}
	},
	
	/**
     * Get the currently loaded track
     * @return {Track} currentTrack
     */
	getCurrentTrack : function(){
		return this.currentTrack;
	},
    
	/**
     * Reset the player
     */
    reset : function(){
		if( this.currentTrack ){
			this.currentTrack.stop();
			// maybe we should destroy this.
		}
		this.currentTrack = null;
		this.playlists = [];
        this.history = [];
		this.index = -1;
    },
	
	/**
	 * Get the current playlist
	 * @return {Playlist}
	 */
	getPlaylist : function(){
		return this.playlists[this.activePlaylistIndex] || null;
	},
	
	/**
	 * Seek the current track by percentage.
	 * @param {Number} percentage A number between 0 and 100
	 */
	seek : function(p){
		if( this.currentTrack ){
			this.currentTrack.setProgressByPercent(p);
		}
	},
    
	// private
    init : function(){
        this.reset();
    },
	
	/**
     * Set the volume of the player
     * @param {Number} level A number between 0 and 100 that specifies the volume level
     */
	setVolume : function(level){
		if( level > 100 ){
			level = 100;
		}
		else if( level < 0 ){
			level = 0;
		}
		this.volume = level;
		if( this.currentTrack){
			this.currentTrack.setVolume(this.volume);
		}
	}
    
});