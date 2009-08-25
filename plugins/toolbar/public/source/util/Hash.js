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
 * @class Fabs.util.Hash
 * @extends Ext.util.Observable
 * A class that represents a simple Hash Collection
 * @constructor
 */
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
	
	/**
	 * Add an key/item pair to the collection
	 * @param {String} key The key for the item
	 * @param {Mixed} object The object to be stored (could be of any type)
	 * @return {Mixed} object Returns the object stored
	 */
	add : function(key,obj){
		if( !this.map[key] ){
			this.map[key] = obj;
			this.items.push(obj);
			this.keys.push(key);
		}
		return obj;
	},
	
	/**
	 * Perform a function on each member of the collection. If a boolean of false is
	 * passed during the performing function, the loop is ended.
	 * @param {Function} function The function to perform. The function is passed <ul>
	 *   <li>The object</li>
	 *   <li>The object's key</li>
	 *   <li>The object's index</li>
	 * </ul>
	 * @param {Object} scope The scope to perform the function within
	 */
	each : function(fn, scope){
		for(var i=0; i<this.items.length; i++){
			if( fn.apply(scope,[this.items[i],this.keys[i],i]) === false ){
				return;
			}
		}
	},
	
	/**
	 * @return {Number} length The length of the collection
	 */
	getLength : function(){
		return this.items.length;
	},
	
	/**
	 * Get all the objects as an array
	 * @return {Array} items
	 */
	asArray : function(){
		return this.items.slice(0);
	},
	
	/**
	 * Remove all the items and keys from the collection
	 */
	clear : function(){
		this.items = [];
		this.keys = [];
		this.map = {};
	},
	
	/**
	 * Get an object from the collection at the specified index
	 * @param {Number} index
	 * @return {Mixed} object
	 */
	getAt : function(index){
		return this.items[index] || null;
	},
	
	/**
	 * Remove an object from the collection at the specified index
	 * @param {Number} index
	 * @return {Mixed} object The removed object or false if there was an error
	 */
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
	
	/**
	 * Remove the specified object from the collection
	 * @param {Mixed} object Object to remove
	 * @return {Mixed} object The removed object or false if there was an error
	 */
	remove : function(obj){
		return this.removeAt( this.indexOf(obj) );
	},
	
	/**
	 * Get the index of a key
	 * @param {String} key
	 * @return {Number} index Index of the key or -1 if not found
	 */
	indexOfKey : function(key){
		return this.keys.indexOf(key);
	},
	
	/**
	 * Get the index of an object
	 * @param {Mixed} object
	 * @return {Number} index Index of the key or -1 if not found
	 */
	indexOf : function(obj){
		return this.items.indexOf(obj);
	}
	
});