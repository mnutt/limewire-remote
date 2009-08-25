/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */


Ext.namespace('Fabs.boombox');(function(){var loaded=false;var local={events:new Ext.util.Observable()};local.events.addEvents('ready');soundManager.onload=function(){loaded=true;local.events.fireEvent('ready');delete local.events;};Fabs.boombox.onSoundManagerReady=function(fn,scope){if(!loaded){local.events.on('ready',fn,scope);}
else{fn.apply(scope);}};var TrackInstances=0;Fabs.boombox.generateTrackId=function(){return'Fabs_BoomBox_Track_'+(TrackInstances++);};})();Fabs.boombox.smSoundEvents=['load','play','pause','resume','whileloading','whileplaying','beforefinish','beforefinishcomplete','justbeforefinish','finish','id3'];