/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */


Fabs.boombox.Player=Ext.extend(Ext.util.Observable,{playlists:[],index:-1,history:[],activePlaylistIndex:-1,autoPlay:false,shuffle:false,volume:80,nextTrack:null,currentTrack:null,autoPlayFlag:false,constructor:function(config){this.addEvents({'play':true,'pause':true,'statechange':true,'playlistadded':true});Ext.apply(this,config);this.init();Fabs.boombox.Player.superclass.constructor.call(this);this.history=[];this.on('playlistadded',this.onPlaylistAdded,this);if(this.playlist){this.addPlaylist(this.playlist);delete this.playlist;}
else{var playlist=new Fabs.boombox.Playlist(Ext.apply(this.playlistCfg||{},{autoLoad:this.autoLoad}));this.addPlaylist(playlist);if(this.tracks){playlist.addTracks(this.tracks.slice(0));delete this.tracks;}}},addPlaylist:function(playlist){this.playlists[this.playlists.length]=playlist;playlist.on('trackadded',this.onPlaylistTrackAdded,this);playlist.on('trackplay',this.onPlaylistTrackPlay,this);playlist.on('trackstop',this.onPlaylistTrackStop,this);playlist.on('trackpause',this.onPlaylistTrackPause,this);playlist.on('trackresume',this.onPlaylistTrackResume,this);playlist.on('trackload',this.onPlaylistTrackLoad,this);playlist.on('trackfinish',this.onPlaylistTrackFinish,this);playlist.on('trackloaderror',this.onPlaylistTrackLoadError,this);this.fireEvent('playlistadded',playlist);},onPlaylistTrackPlay:function(track){if(!this.currentTrack||track!=this.currentTrack){if(this.currentTrack){this.currentTrack.stop();}
this.currentTrack=track;this.fireEvent('statechange',this);this.fireEvent('trackchange',this,track);}
if(track.id3){this.updateTrackInfo(track);}
else{track.on('id3',this.updateTrackInfo,this);}
track.setVolume(this.volume);this.fireEvent('statechange',this);},onPlaylistTrackPause:function(track){this.fireEvent('statechange',this);},onPlaylistTrackStop:function(track){this.fireEvent('statechange',this);},onPlaylistTrackResume:function(track){this.autoPlayFlag=false;track.setVolume(this.volume);this.fireEvent('statechange',this);},updateTrackInfo:function(track){},onPlaylistTrackFinish:function(){this.next();this.fireEvent('statechange',this);},onPlaylistAdded:function(playlist){if(this.activePlaylistIndex==-1){this.activePlaylistIndex=0;}},onPlaylistTrackAdded:function(track,isLast,playlist){if(isLast&&!this.isPlaying()&&this.autoPlay){this.getNextTrack().play();this.autoPlay=false;}},onPlaylistTrackLoadError:function(track){this.next();},play:function(track){if(!this.currentTrack&&!track){this.updateCurrentTrack();}
if(track&&track!=this.currentTrack){if(this.currentTrack){this.currentTrack.stop();}
this.index=this.history.length;this.history[this.index]=this.currentTrack=track;this.fireEvent("trackchange",this,track);}
if(this.currentTrack){this.currentTrack.play();this.playing=true;}},togglePlay:function(){if(this.isPlaying()){this.pause();}
else{this.play();}},toggleShuffle:function(){this.shuffle=!this.shuffle;this.fireEvent('statechange',this);},next:function(){this.updateCurrentTrack();if(this.currentTrack){this.currentTrack.play();}},prev:function(){if(this.index>0&&this.index-1<this.history.length){if(this.currentTrack){this.currentTrack.stop();}
this.index--;this.currentTrack=this.history[this.index];this.fireEvent('trackchange',this,this.currentTrack);this.currentTrack.play();}},updateCurrentTrack:function(){if(this.currentTrack){this.currentTrack.stop();}
if(this.index<this.history.length-1&&this.index>-1){this.index++;this.currentTrack=this.history[this.index];}
else{this.index=this.history.length;this.history[this.index]=this.currentTrack=this.getNextTrack();}
if(this.currentTrack){this.fireEvent('trackchange',this,this.currentTrack);}},getNextTrack:function(){var pl=this.getPlaylist();return pl?pl.getNext(this.shuffle):null;},isPlaying:function(){return this.currentTrack&&this.currentTrack.isPlaying();},pause:function(){if(this.isPlaying()){this.currentTrack.pause();this.playing=false;}},stop:function(){if(this.currentTrack){this.currentTrack.stop();}},getCurrentTrack:function(){return this.currentTrack;},reset:function(){if(this.currentTrack){this.currentTrack.stop();}
this.currentTrack=null;this.playlists=[];this.history=[];this.index=-1;},getPlaylist:function(){return this.playlists[this.activePlaylistIndex]||null;},seek:function(p){if(this.currentTrack){this.currentTrack.setProgressByPercent(p);}},init:function(){this.reset();},setVolume:function(level){if(level>100){level=100;}
else if(level<0){level=0;}
this.volume=level;if(this.currentTrack){this.currentTrack.setVolume(this.volume);}}});