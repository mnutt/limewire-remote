/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */


Fabs.boombox.Playlist=Ext.extend(Ext.util.Observable,{index:-1,history:null,tracks:null,remaining:[],constructor:function(config){if(Ext.isArray('array')){config={tracks:config};}
this.addEvents.apply(this,Fabs.boombox.smSoundEvents);this.addEvents({'trackadded':true,'trackremoved':true,'trackloaderror':true});Ext.apply(this,config);this.history=new Fabs.util.Hash();this.remaining=[];if(this.tracks&&this.tracks.length>0){var t=this.tracks.slice(0);this.tracks=new Fabs.util.Hash();this.addTracks(t);}
else{this.tracks=new Fabs.util.Hash();}
this.on('trackplay',this.onTrackPlay,this);this.on('trackloaderror',this.onTrackLoadError,this);Fabs.boombox.Playlist.superclass.constructor.call(this);},clear:function(){this.tracks.clear();this.history.clear();},addTracks:function(tracks){Ext.each(tracks,function(track,index){this.addTrack(track,index==tracks.length-1);},this);},addTrack:function(track,isLast){if(typeof isLast=='undefined'){isLast=true;}
if(typeof track=='string'){track={url:track};}
if(!track.addEvents){track=Ext.apply({autoLoad:this.autoLoad},track);track=new Fabs.boombox.Track(track);}
var events=Fabs.boombox.smSoundEvents.slice(0);events.splice(0,0,'stop','positionchange','loaderror');this._relayTrackEvents(track,events);this.tracks.add(track.id,track);this.fireEvent('trackadded',track,isLast,this);},_relayTrackEvents:function(o,events){var createHandler=function(ename){return function(){var args=Array.prototype.slice.call(arguments,0);args.splice(0,0,ename);return this.fireEvent.apply(this,args);};};for(var i=0,len=events.length;i<len;i++){var ename=events[i];if(!this.events[ename]){this.events[ename]=true;}
o.on(ename,createHandler('track'+ename),this);}},getNext:function(shuffle){if(shuffle){var tmp=[];if(this.history.getLength()<this.tracks.getLength()){this.tracks.each(function(track){if(!track.loadError&&this.history.indexOf(track)==-1){tmp[tmp.length]=track;}},this);if(tmp.length==0&&this.history.getLength()>0){tmp=this.history.asArray();this.history.clear();}}
else{this.history.clear();tmp=this.tracks.asArray();}
var tmpIndex=parseInt(Math.round(Math.random()*(tmp.length-1)),10);return tmp[tmpIndex];}
else{this.index++;if(this.index>this.tracks.getLength()-1){this.index=0;}
return this.tracks.getAt(this.index);}},onTrackPlay:function(track){this.history.add(track.id,track);this.index=this.tracks.indexOf(track);},onTrackLoadError:function(track){return this.tracks.remove(track);}});