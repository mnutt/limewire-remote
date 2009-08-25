/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */


Ext.namespace('Fabs.boombox.ui');Fabs.boombox.ui.SimpleButton=Ext.extend(Ext.util.Observable,{url:'',align:'left',volume:90,constructor:function(cfg){Ext.apply(this,cfg);Fabs.boombox.ui.SimpleButton.superclass.constructor.call(this);this.track=new Fabs.boombox.Track({url:this.url});this.track.setVolume(this.volume);this.track.on('play',this.onPlaying,this);this.track.on('resume',this.onPlaying,this);this.track.on('pause',this.onNotPlaying,this);this.track.on('stop',this.onNotPlaying,this);this.track.on('finish',this.onFinish,this);if(this.renderTo){this.render(this.renderTo);}
if(this.autoPlay){this.track.play();}},render:function(el){this.el=Ext.get(el);this.el.update('');this.el.addClass('simple-button');this.el.on('click',this.onClick,this);},onPlaying:function(){this.el.addClass('simple-button-playing');},onNotPlaying:function(){this.el.removeClass('simple-button-playing');},onFinish:function(){this.track.stop();},onClick:function(e){e.stopEvent();this.track[this.track.isPlaying()?'pause':'play']();}});Fabs.boombox.ui.SimpleButton.create=function(selector,defaultCfg){Ext.onReady(function(){Ext.select(selector).each(function(el){var cfg={renderTo:el,url:el.dom.href};new Fabs.boombox.ui.SimpleButton(Ext.apply(defaultCfg||{},cfg));});});};