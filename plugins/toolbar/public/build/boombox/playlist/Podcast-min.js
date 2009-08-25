/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */


Ext.namespace('Fabs.boombox.playlist');Fabs.boombox.playlist.Podcast=Ext.extend(Fabs.boombox.Playlist,{constructor:function(cfg){if(typeof cfg=='string'){cfg={url:cfg};}
Fabs.boombox.playlist.Podcast.superclass.constructor.apply(this,arguments);if(this.url){this.loadUrl(this.url);}
else if(this.xml){this.loadXML(this.xml);}},loadUrl:function(url){Ext.Ajax.request({url:url,scope:this,success:this.onRequestSuccess,failure:this.onRequestFailure});},onRequestSuccess:function(response){this.loadXML(response.responseXML);},onRequestFailure:function(response){},loadXML:function(doc){var root=doc.documentElement||doc;this.clear();var q=Ext.DomQuery,songname='',artist='',tracks=[];Ext.each(q.select('channel item',root),function(item){var title=q.selectValue('title',item);tracks[tracks.length]={url:q.selectValue('link',item),title:title};},this);this.addTracks(tracks);}});