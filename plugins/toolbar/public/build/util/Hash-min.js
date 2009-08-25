/*
 * Fab's BoomBox
 * Copyright(c) 2006, Mark Fabrizio Jr..
 * 
 * This code is licensed under BSD license. Use it as you wish, 
 * but keep this copyright intact.
 */


Ext.namespace('Fabs.util');Fabs.util.Hash=Ext.extend(Ext.util.Observable,{items:[],keys:[],map:{},constructor:function(){Fabs.util.Hash.superclass.constructor.call(this);},add:function(key,obj){if(!this.map[key]){this.map[key]=obj;this.items.push(obj);this.keys.push(key);}
return obj;},each:function(fn,scope){for(var i=0;i<this.items.length;i++){if(fn.apply(scope,[this.items[i],this.keys[i],i])===false){return;}}},getLength:function(){return this.items.length;},asArray:function(){return this.items.slice(0);},clear:function(){this.items=[];this.keys=[];this.map={};},getAt:function(index){return this.items[index]||null;},removeAt:function(index){if(index<this.items.length&&index>=0){var o=this.items[index];this.items.splice(index,1);var key=this.keys[index];if(typeof key!="undefined"){delete this.map[key];}
this.keys.splice(index,1);return o;}
return false;},remove:function(obj){return this.removeAt(this.indexOf(obj));},indexOfKey:function(key){return this.keys.indexOf(key);},indexOf:function(obj){return this.items.indexOf(obj);}});