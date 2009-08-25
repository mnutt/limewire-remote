/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */


Ext.namespace('Fabs.boombox.playlist');Fabs.boombox.playlist.Xspf=Ext.extend(Fabs.boombox.Playlist,{constructor:function(cfg){if(typeof cfg=='string'){cfg={url:cfg};}
Fabs.boombox.playlist.Xspf.superclass.constructor.apply(this,arguments);if(this.url){this.loadUrl(this.url);}
else if(this.xml){this.loadXML(this.xml);}},loadUrl:function(url){Ext.Ajax.request({url:url,scope:this,success:this.onRequestSuccess,failure:this.onRequestFailure});},onRequestSuccess:function(response){this.loadXML(response.responseXML);},onRequestFailure:function(response){},loadXML:function(doc){this.clear();var root=doc.documentElement||doc;var q=Ext.DomQuery,songname='',artist='',title='',tracks=[],annotation;Ext.each(q.select('trackList track',root),function(track){annotation=q.selectValue('annotation',track);songname=q.selectValue('title',track);artist=q.selectValue('creator',track);title=artist+' - '+songname;if(annotation&&(!songname||!artist)){title=annotation;}
tracks[tracks.length]={url:q.selectValue('location',track),title:title,songname:songname,artist:artist};},this);this.addTracks(tracks);}});