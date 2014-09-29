'use strict';

(function(global) {	
	var _G = global.grafar,
		union = _G.union,
		Observable = _G.Observable,
		isExisty = _G.isExisty;
	
	var generators = {};
	
	function Generator() {
		Observable.call(this);
		this.actions = [];
	}
	
	Generator.prototype = new Observable();
	
	Generator.prototype.set = function() {
	};
	
	Generator.prototype.update = function() {
	};
	
	Generator.prototype.execute = function(table) {
		this.actions.forEach(function(action) {
			action(table);
		});
		return table;
	};
	
	
	// exports
	
	_G.generators = generators;
	_G.Generator = Generator;
}(this));