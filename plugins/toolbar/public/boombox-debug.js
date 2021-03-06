/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */

Ext.namespace('Fabs.boombox');
(function(){
	var loaded = false;
	var local={
		events:new Ext.util.Observable()
	};
	local.events.addEvents('ready');
	soundManager.onload = function(){
		loaded = true;
		local.events.fireEvent('ready');
		delete local.events;
	};
	Fabs.boombox.onSoundManagerReady = function(fn, scope){
		if( !loaded ){
			local.events.on('ready', fn, scope);
		}
		else{
			fn.apply(scope);
		}
	};
    var TrackInstances=0;
    Fabs.boombox.generateTrackId = function(){
		
        return 'Fabs_BoomBox_Track_'+(TrackInstances++);
    };
})();

Fabs.boombox.smSoundEvents = ['load','play','pause','resume','whileloading','whileplaying','beforefinish','beforefinishcomplete','justbeforefinish','finish','id3'];




Ext.namespace('Fabs.util');
Fabs.util.Hash = Ext.extend( Ext.util.Observable, {
	
	// private
	items : [],
	
	// private
	keys : [],
	
	// private
	map : {},
	
	constructor : function(){
		Fabs.util.Hash.superclass.constructor.call(this);
	},
	
	
	add : function(key,obj){
		if( !this.map[key] ){
			this.map[key] = obj;
			this.items.push(obj);
			this.keys.push(key);
		}
		return obj;
	},
	
	
	each : function(fn, scope){
		for(var i=0; i<this.items.length; i++){
			if( fn.apply(scope,[this.items[i],this.keys[i],i]) === false ){
				return;
			}
		}
	},
	
	
	getLength : function(){
		return this.items.length;
	},
	
	
	asArray : function(){
		return this.items.slice(0);
	},
	
	
	clear : function(){
		this.items = [];
		this.keys = [];
		this.map = {};
	},
	
	
	getAt : function(index){
		return this.items[index] || null;
	},
	
	
	removeAt : function(index){
		if(index < this.items.length && index >= 0){
            var o = this.items[index];
            this.items.splice(index, 1);
            var key = this.keys[index];
            if(typeof key != "undefined"){
                delete this.map[key];
            }
            this.keys.splice(index, 1);
            return o;
        }
        return false;
	},
	
	
	remove : function(obj){
		return this.removeAt( this.indexOf(obj) );
	},
	
	
	indexOfKey : function(key){
		return this.keys.indexOf(key);
	},
	
	
	indexOf : function(obj){
		return this.items.indexOf(obj);
	}
	
});



Fabs.boombox.Track = Ext.extend( Ext.util.Observable, {
	
	
	url : '',
	
	
	title : '',
	
	
	songname : '',
	
	
    artist : '',
	
	
	track : '',
	
	
	album : '',
	
	
	year : '',
	
	
	volume : 70,
	
	
	position: 0,
	
	
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
        
		
		
		
		
		
		
		
		
        this.addEvents.apply(this,Fabs.boombox.smSoundEvents);
		this.addEvents(
			
			'stop',
			
			
			'loaderror',
			
			
			'infochange',
			
			
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
	
	
	isPlaying : function(){
		return this.playing;
	},
	
	
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
	
	
	play : function(){
		this.onReady(function(){
			this.soundObject[this.started?'resume':'play']();
		}, this);
		return this;
	},
	
	
	pause : function(){
		if( this.playing && this.soundObject ){
			this.soundObject.pause();
		}
		return this;
	},
	
	
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
			
			
			'trackadded'			:true,
			
			'trackremoved'			:true,
			
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
	
	
	addTracks : function(tracks){
		Ext.each(tracks, function(track, index){
			this.addTrack(track, index==tracks.length-1);
		},this);
	},
    
	
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




Fabs.boombox.Player = Ext.extend( Ext.util.Observable, {
    
	
    playlists : [],
	
	
	index : -1,
	
	
	history : [],
	
	activePlaylistIndex : -1,
	
	
	autoPlay : false,
	
	
	shuffle : false,
	
	
	volume : 80,
	
	// private
	nextTrack : null,
	
	
	currentTrack : null,
	
	// private
	autoPlayFlag : false,
    
    constructor : function(config){
		
        this.addEvents({
			
            'play'        		:true,
			
			
            'pause'             :true,
			
			
			'statechange'		:true,
			
			
			
			
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
		
		if( isLast && !this.isPlaying() && this.autoPlay ){
			this.getNextTrack().play();
			this.autoPlay = false;
		}
	},
	
	// private
	onPlaylistTrackLoadError : function(track){
		this.next();
	},
	
	
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
	
	
	togglePlay : function(){
		if( this.isPlaying() ){
			this.pause();
		}
		else{
			this.play();
		}
	},
	
	
	toggleShuffle : function(){
		this.shuffle = !this.shuffle;
		this.fireEvent('statechange',this);
	},
	
	
	next : function(){
		this.updateCurrentTrack();
		if( this.currentTrack ){
			this.currentTrack.play();
		}
	},
	
	
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
	
	
	isPlaying : function(){
		return this.currentTrack && this.currentTrack.isPlaying();
	},
	
	
	pause : function(){
		if( this.isPlaying() ){
			this.currentTrack.pause();
			this.playing = false;
		}
	},
	
	
	stop : function(){
		if( this.currentTrack ){
			this.currentTrack.stop();
		}
	},
	
	
	getCurrentTrack : function(){
		return this.currentTrack;
	},
    
	
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
	
	
	getPlaylist : function(){
		return this.playlists[this.activePlaylistIndex] || null;
	},
	
	
	seek : function(p){
		if( this.currentTrack ){
			this.currentTrack.setProgressByPercent(p);
		}
	},
    
	// private
    init : function(){
        this.reset();
    },
	
	
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
Ext.namespace('Fabs.boombox.playlist');



Fabs.boombox.playlist.Xspf = Ext.extend( Fabs.boombox.Playlist, {
    
	
	
	
	
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
Ext.namespace('Fabs.boombox.playlist');



Fabs.boombox.playlist.Podcast = Ext.extend( Fabs.boombox.Playlist, {
    
	
	
	
	
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
Ext.namespace('Fabs.boombox.ui');



Fabs.boombox.ui.FullPlayer = Ext.extend( Ext.util.Observable, {
    
    
    width : 'auto',
    
    
    player : null,
    
    
    scrollIncrement : 2,
    
    
    scrollHold : 20,
    
    
    opacity: 1,
    
    
    zIndex : 100,
    
    
    updateInterval : 80,
    
    
    maxListHeight: 100,
    
    
    emptyText : 'Fab\'s BoomBox!',
    
    
    lang : {
        prev            :'Previous Song',
        play            :'Play Song',
        pause           :'Pause Song',
        next            :'Next Song',
        stop            :'Stop Song',
        openPlaylist    :'Open Playlist',
        closePlaylist   :'Close Playlist',
        shuffle         :'Shuffle',
        volume          :'Adjust Volume'
    },
    
    
    loadingText : 'Loading Track Information...',
    
    
    trackTpl : '{playlistIndex}. {title}',
    
    
    unknownTrackTpl : '{playlistIndex}. {filename}',
    
    
    draggable : false,
    
    
    resizeable : false,
    
    
    minWidth : 200,
    
    
    
    // private
    labelScrollDirection : -1, // false for right,  true for left
    
    btns : {},
    
    
    constructor : function(config){
        Ext.apply(this, config);
        Fabs.boombox.ui.FullPlayer.superclass.constructor.call(this);
        
        if( !this.tpl ){
            this.tpl = [
                '<div class="bb-ct boombox">',
                    '<div class="bb-player-ct">',
                        '<div class="bb-player-l"></div>',
                        '<div class="bb-player-r"></div>',
                        '<div class="bb-player-c">',
                            '<a href="javascript:;" class="bb-button bb-button-prev" title="',this.lang.prev,'"></a>',
                            '<a href="javascript:;" class="bb-button bb-big-button bb-button-play" title="',this.lang.play,'"></a>',
                            '<a href="javascript:;" class="bb-button bb-button-next" title="',this.lang.next,'"></a>',
                            '<a href="javascript:;" class="bb-button bb-button-stop" title="',this.lang.stop,'"></a>',
                            '<div class="bb-right-buttons">',
                                '<a href="javascript:;" class="bb-button bb-button-playlist" title="',this.lang.openPlaylist,'"></a>',
                                '<a href="javascript:;" class="bb-button bb-button-shuffle" title="',this.lang.shuffle,'"></a>',
                                '<a href="javascript:;" class="bb-button bb-button-volume" title="',this.lang.volume,'"><div class="bb-button bb-button-volume-overlay"></div></a>',
                            '</div>',
                            '<div class="bb-track-ct">',
                                '<div class="bb-track-name-ct">',
                                    '<div class="bb-track-name-scroller">',
                                        '<div class="bb-track-name" unselectable="true" onselectstart="return false;">',this.emptyText,'</div>',
                                    '</div>',
                                '</div>',
                                '<div class="bb-track-progress">',
                                    '<div class="bb-track-progress-overlay"></div>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div class="bb-playlist-ct">',
                        '<div class="bb-playlist-scroller"></div>',
                    '</div>',
                '</div>'
            ];
        }
        this.tpl = new Ext.Template(this.tpl);
        
        this.trackTpl = new Ext.Template(this.trackTpl);
        this.unknownTrackTpl = new Ext.Template(this.unknownTrackTpl);
        
        if( this.renderTo ){
            Ext.onReady(function(){
                this.render(this.renderTo);
            }, this);
        }
        this.player.on({
            scope               :this,
            statechange         :this.onPlayerStateChange,
            trackchange         :this.onPlayerTrackChange
        });
        
        this.updateTask = {
            run                 :this.update.createDelegate(this),
            interval            :this.updateInterval
        };
        
        this.scrollHoldIndex=0;
    },
    
    
    render : function(el){
        
        this.el = Ext.get(el);
        // lets get a reference to the ownerDocument
        this.doc = this.el.dom.ownerDocument;
        this.el.update(this.tpl.applyTemplate({}));
        // now lets get refs to our elements
        this.ct = this.el.child('.bb-ct');
        if( this.pos ){
            this.ct.setXY(this.pos);
        }
        this.ct.setStyle('z-index',this.zIndex);
        
        if( this.resizeable ){
            this.resizeHandle = this.ct.child('.bb-player-r');
            //this.resizeHandle.on('mousedown', this.onResizeHandleMouseDown, this);
            this.ct.addClass('resizeable');
            this.createDragEvent(
                this.resizeHandle,
                this.resizeInit,
                this.resizeMove,
                this
            );
        }
        
        if( this.draggable ){
            this.dragHandle = this.ct.child('.bb-player-l');
            this.ct.addClass('draggable');
            this.createDragEvent(
                this.ct,
                this.dragInit,
                this.dragMove,
                this
            );
        }
        
        this.playerCenter = this.ct.child('.bb-player-c');
        
        // player and buttons
        this.playerCt = this.ct.child('.bb-player-ct');
        this.createButton( this.playerCt, 'prev');
        this.createButton( this.playerCt, 'play');
        this.createButton( this.playerCt, 'next');
        this.createButton( this.playerCt, 'stop');
        this.createButton( this.playerCt, 'playlist');
        // this.btns['playlist'].un('click', this.btnHandlers['playlist']);
        
        // volume (lazy slider...)
        this.volumeBtn = this.playerCt.child('.bb-button-volume');
        this.volumeOverlay = this.volumeBtn.child('.bb-button-volume-overlay');
        this.createDragEvent(
            this.volumeBtn,
            this.onVolumeButtonMouseDown,
            this.onVolumeButtonMouseEvent,
            this
        );
        this.volumeBtn.on('keydown', this.onVolumeKeyDown, this);
        //this.volumeOverlay.on('click', this.onVolumeButtonClick, this);
        
        // shuffle
        this.shuffleBtn = this.playerCt.child('.bb-button-shuffle');
        this.shuffleBtn.on('click', function(){
            this.player.toggleShuffle();
        }, this);
        
        // track container
        this.trackCt = this.playerCt.child('.bb-track-ct');
        this.trackScroller = this.trackCt.child('.bb-track-name-scroller');
        this.trackLabel = this.trackCt.child('.bb-track-name');
        this.createDragEvent(
            this.trackLabel,
            this.onTrackLabelMouseDown,
            this.onTrackLabelMouseMove,
            this,
            function(){ this.trackLabelMouseOrigin=null; }
        );
        
        this.trackProgress = this.trackCt.child('.bb-track-progress');
        this.trackProgressOverlay = this.trackProgress.child('.bb-track-progress-overlay');
        this.createDragEvent(
            this.trackProgress,
            this.onTrackProgressMouseDown,
            this.onTrackProgressMouseEvent,
            this
        );
        
        // playlist container
        this.playlistCt = this.ct.child('.bb-playlist-ct');
        this.playlistCt.setOpacity(0, false);
        this.playlistScroller = this.playlistCt.child('.bb-playlist-scroller');
        this.playlistCt.on('scroll', function(e){ if(e&&e.stopPropogation) e.stopPropogation(); } );
        
        this.onPlayerStateChange();
        this.setWidth(this.width);
        Ext.TaskMgr.start(this.updateTask);
        this.resetTrackScroll.defer(1,this);
        this.updateVolumeOverlay();
        this.ct.setStyle('opacity', this.opacity);
        if( this.player.currentTrack ){
            this.currentTrack = this.player.currentTrack;
            this.updateTrackInfo();
        }
    },
    
    
    unrender : function(){
        Ext.TaskMgr.stop(this.updateTask);
        Ext.each([this.shuffleBtn, this.playlistCt, this.trackProgress, this.trackLabel, this.volumeBtn], function(o){
            o.removeAllListeners();
            // a little housecleaning to keep our EventManager from getting too big.
            delete Ext.EventManager.elHash[o.dom.id];
        });
        for(var name in this.btns){
            this.btns[name].removeAllListeners();
            // a little housecleaning to keep our EventManager from getting too big.
            delete Ext.EventManager.elHash[this.btns[name].dom.id];
        }
        this.ct.remove();
    },
    
    // private
    resizeInit : function(e){
        this.resizeOrigin = {x: e.getPageX(), width: this.playerCt.getWidth()};
    },
    
    // private
    resizeMove : function(e){
        var w = Math.max( this.resizeOrigin.width+e.getPageX()-this.resizeOrigin.x, this.minWidth );
        this.setWidth(w);
        e.preventDefault();
    },
    
    // private
    dragInit : function(e){
        if( !e.within(this.playerCt.dom)){ return false; }
        this.dragOffset = {x: e.getPageX()-this.ct.getX(), y: e.getPageY()-this.ct.getY() };
        return true;
    },
    
    // private
    dragMove : function(e){
        var pos = [e.getPageX()-this.dragOffset.x, e.getPageY()-this.dragOffset.y];
        if( pos[0] < 0 ){ pos[0] = 0; }
        if( pos[1] < 0 ){ pos[1] = 0; }
        this.pos = pos;
        this.ct.setXY(this.pos);
        e.preventDefault();
    },
    
    
    setWidth : function(w){
        this.width = w;
        if( this.ct ){
            if( this.width == 'auto' ){
                this.ct.setStyle({'width':'auto'});
            }else{
                this.ct.setStyle('width', this.width+'px');
            }
            this.playlistCt.setStyle( 'width', this.playerCenter.getWidth()+'px' );
        }
    },
    
    
    // private
    createButton : function(parent, name, fn){
        this.btns[name] = parent.child('.bb-button-'+name);
        this.btns[name].on('click', this.onButtonClick.createDelegate(this,[name],0) );
    },
    
    // private
    onButtonClick : function(name,e){
        e.stopPropagation();
        switch(name){
            case 'prev':
            case 'next':
            case 'stop':
                this.player[name]();
                break;
            case 'play':
                this.player.togglePlay();
                break;
            case 'playlist':
                this.togglePlaylist();
                break;
        }
    },
    
    createDragEvent : function(el, onMouseDown, onMouseMove, scope, onMouseUp ){
        var doc = this.doc;
        var E = Ext.EventManager;
        var mouseMove = function(e){
            e.stopPropagation();
            e.preventDefault();
            onMouseMove.apply( scope, arguments );
        };
        var mouseUp = function(e){
            e.preventDefault();
            if( onMouseUp ){
                onMouseUp.apply(scope,arguments);
            }
            E.un(doc,'mousemove', mouseMove, scope );
            E.un(doc,'mouseup', mouseUp, scope );
        };
        var mouseDown = function(e){
            e.stopPropagation();
            e.preventDefault();
            if( onMouseDown.apply(scope, arguments) !== false ){
                E.on(doc,'mousemove', mouseMove, scope );
                E.on(doc,'mouseup', mouseUp, scope );
            }
        };
        el.on('mousedown', mouseDown, scope);
    },
    
    // private
    onVolumeButtonMouseDown : function(e){
        this.onVolumeButtonMouseEvent(e);
    },
    
    // private
    onVolumeButtonMouseEvent : function(e){
        var mx = e.getPageX();
        var vx = this.volumeBtn.getX();
        var w = this.volumeBtn.getWidth();
        var p = Math.max( Math.min((mx-vx)/w * 100, 100), 0 );
        this.player.setVolume(p);
        this.updateVolumeOverlay(p);
        e.preventDefault();
    },
    
    // private
    onTrackProgressMouseDown : function(e){
        this.onTrackProgressMouseEvent(e);
    },
    
    // private
    onTrackProgressMouseEvent : function(e){
        var mx = e.getPageX();
        var tx = this.trackProgress.getX();
        var w = this.trackProgress.getWidth();
        var p = Math.max( Math.min((mx-tx)/w * 100, 100), 0 );
        this.player.seek(p);
        e.preventDefault();
    },
    
    // private
    onVolumeKeyDown : function(e){
        var v = this.player.volume;
        if( e.getKey() == 38 ){
            v = Math.min(v+5,100);
        }
        else if( e.getKey() == 40 ){
            v = Math.max(v-5,0);
        }
        this.player.setVolume(v);
        this.updateVolumeOverlay(v);
    },
    
    // private
    onTrackLabelMouseDown : function(e){
        this.trackLabelMouseOrigin = {x: e.getPageX(), scrollLeft: this.trackScroller.getScroll().left};
    },
    
     // private
    onTrackLabelMouseMove : function(e){
        var d = this.trackLabelMouseOrigin.x - e.getPageX();
        var lw = this.trackLabel.getWidth();
        var lc = this.trackScroller.getWidth(true);
        if( lw > lc ){
            var o = lw - lc;
            var left = this.trackLabelMouseOrigin.scrollLeft;
            this.trackScroller.scrollTo('left', Math.max( Math.min(o, d+left), 0) );
        }
        e.preventDefault();
    },
    
    // private
    onPlayerStateChange : function(){
        this.playerCt[this.player.isPlaying()?'addClass':'removeClass']('bb-playing');
        this.playerCt[this.player.shuffle?'addClass':'removeClass']('shuffle');
        this.btns.play.dom.title = this.lang[ this.player.isPlaying() ? 'pause' : 'play' ];
    },
    
    // private
    onPlayerTrackChange : function(player, track){
        if( this.currentTrack && this.currentTrack == track ){
            return;
        }
        if( this.currentTrack && this.currentTrack != track ){
            track.un('infochange', this.updateTrackInfo, this);
        }
        this.currentTrack = track;
        if( track.hasSongInfo('title') ){
            this.updateTrackInfo();
        }
        else{
            this.resetTrackScroll();
            if( this.trackLabel ){
                this.trackLabel.update(this.loadingText);
            }
        }
        track.on('infochange', this.updateTrackInfo, this );
        // track.on('positionchange', this.updateTrackPosition, this);
    },
    
    // private
    resetTrackScroll : function(){
        if( this.trackScroller ){
            this.trackScroller.scrollTo('left',0);
        }
        this.labelScrollDirection=-1;
        this.scrollHoldIndex=0;
    },
    
    // private
    updateTrackInfo : function(){
        this.resetTrackScroll();
        this.trackLabel.update((this.player.getPlaylist().tracks.indexOf(this.currentTrack)+1)+'. '+this.currentTrack.title);
    },
    
    // private
    updateTrackPosition : function(){
        if( !this.currentTrack ){
            return;
        }
        try{
            this.trackProgressOverlay.setStyle( 'width', this.currentTrack.getProgressPercent()+'%');
        }
        catch(e){
            // something weird with IE
        }
    },
    
    // private
    updateVolumeOverlay : function(p){
        this.volumeOverlay.setWidth(parseInt((p||this.player.volume), 10)+'%');
    },
    
    // private
    updateTrackLabelPosition : function(){
        if( this.trackLabelMouseOrigin ){
            return;
        }
        var lw = this.trackLabel.getWidth();
        var lc = this.trackScroller.getWidth(true);
        if( lw > lc ){
            var o = lw - lc;
            var left = parseInt(this.trackScroller.getScroll().left,10);
            if( left <= 0 || left >= o){
                if( this.scrollHoldIndex < this.scrollHold ){
                    this.scrollHoldIndex++;
                    return;
                }
                else{
                    this.scrollHoldIndex=0;
                }
                this.labelScrollDirection *= -1;
            }
            var d = this.scrollIncrement * this.labelScrollDirection;
            this.trackScroller.scrollTo('left',left+d);
        }
        else{
            this.trackScroller.scrollTo('left',0);
        }
        
    },
    
    // private
    update : function(){
        this.updateTrackPosition();
        this.updateTrackLabelPosition();
    },
    
    // private
    playlistClickTest : function(e){
        if( !e.within( this.ct.dom ) ){
            this.togglePlaylist();
        }
    },
    
    
    togglePlaylist : function(){
        var E = Ext.EventManager;
        if( this.playlistCt.getHeight() > 0 || this.playlistCt.getStyle('opacity') > 0){
            this.btns.playlist.dom.title = this.lang.openPlaylist;
            this.ct.removeClass('playlist-open');
            E.un(this.doc,'click', this.playlistClickTest, this);
            this.playlistCt.un('click', this.onPlaylistCtClick, this);
            this.playlistCt.setHeight(0, true);
            this.playlistCt.setOpacity(0, true);
            return false;
        }
        this.btns.playlist.dom.title = this.lang.closePlaylist;
        this.ct.addClass('playlist-open');
        E.on(this.doc,'click', this.playlistClickTest, this);
        this.playlistCt.setWidth( this.playerCenter.getWidth() );
       
        // lets neatly remove all old elements if they exist...
        if( this.trackMap ){
            for( var i in this.trackMap ){
                
                var el = this.doc.getElementById(i);
                if( el ){
                    el.parentNode.removeChild(el);
                }
            }
        }
        
        this.trackMap = {};
        
        // we don't use this yet, but would be cool to update tracks
        // when there is an info change (id3 events)
        this.trackMapR = {};
        this.playlistScroller.update('');
        
        // this just ensures that the playlist is empty.
        this.player.getPlaylist().tracks.each( function(track, key, index){
            track.playlistIndex = index+1;
            try{
                track.filename = /\/([^\/]*)$/.exec( decodeURIComponent( track.url))[1].replace(/\.mp3$/, '');
            }catch(e){
                track.filename = track.url;
            }
            var el = this.playlistScroller.createChild({
                tag             :'a',
                href            :'javascript:;',
                cls             :'bb-track',
                html            :this[track.hasSongInfo('title')?'trackTpl':'unknownTrackTpl'].apply(track)
            });
            this.trackMap[el.dom.id] = track;
            this.trackMapR[track.id] = el;
        }, this);
       
        var h = this.playlistScroller.getHeight(true);
        this.playlistCt.setHeight( this.maxListHeight ? Math.min( this.maxListHeight,h) : h, true );
        this.playlistCt.setOpacity(0);
        this.playlistCt.setOpacity(1, true);
        this.playlistCt.on('click', this.onPlaylistCtClick, this);
        return false;
    },
    
    onPlaylistCtClick : function(e){
        var t = e.getTarget();
        this.player.play(this.trackMap[t.id]);
    }
    
    
});
Ext.namespace('Fabs.boombox.ui');



Fabs.boombox.ui.SimpleButton = Ext.extend( Ext.util.Observable, {
    
    
    url : '',
    
    
    align : 'left',
    
    
    volume : 90,
    
    
    
    
    
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


Fabs.boombox.ui.SimpleButton.create = function(selector, defaultCfg){
    Ext.onReady( function(){
        Ext.select( selector ).each( function(el){
            var cfg = {renderTo:el, url:el.dom.href};
            new Fabs.boombox.ui.SimpleButton(Ext.apply(defaultCfg||{},cfg));
        });
    });
};
