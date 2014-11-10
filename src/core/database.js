'use strict';
	
(function(global) {
	var _G = global.grafar,
		Observable = _G.Observable,
		intersection = _G.intersection,
		interPower = _G.interPower,
		haveCommon = _G.haveCommon,
		union = _G.union,
		firstMatch = _G.firstMatch,
		GraphData = _G.GraphData,
		setMinus = _G.setMinus,
		setpush = _G.setpush,
		isExisty = _G.isExisty,
		asArray = _G.asArray,
		Table2 = _G.Table2;
	
	
	function Database(opts) {
		Observable.call(this);
		
		this.tables = [];
		this.constraints = [];
		this.known = {};
		this.graph = new GraphData();
	}
	
	Database.prototype = new Observable();
	
	Database.prototype.constrain = function(constraint) {
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || function() {},
			maxlen = constraint.maxlen,
			isExplicit = haveCommon(names, using),
			fn = constraint.fn || function() { return 0; },
			onConflict = 'overwrite';
			
		var conflicts = this.constraints.filter(function(c) {
				return haveCommon(c.what, names);
			}),
			def = {
				what: names, // is the matching connectivity component
				as: as,
				maxlen: maxlen // only for root CCs
			};
		
		if (conflicts.length !== 0) {
			if (onConflict === 'overwrite')
				this.constraints = setMinus(this.constraints, conflicts);
			// Merge dupe explicit: x = f(v) <- x = g(v): add f(v) = g(v)
			// Adding i to e: x = f(v) <- f(x, v) = g(u): Will cascade
			// Adding i to i: F(v) = 0 <- G(v) = 0: OK for ConComp
		}
		this.constraints.push(def);
		
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			this.known[name] = false; // tabwise

			this.graph.addNode(name);
			for (var j = 0; j < using.length; j++)
				this.graph.addEdge(using[j], name);
		}
		
		var cascadeChanges = this.graph.down(names);
		for (var i = 0; i < cascadeChanges.length; i++)
			this.known[cascadeChanges[i]] = false;

		return this;
	};
	
	Database.prototype.select = function(names) {
		names = asArray(names);
		
		if (names.length === 0)
			return new Table2();
			
		// evaluate all definitions
		// problem: r-copies of atomic table remain the same!
		for (var i = 0; i < names.length; i++) {
			if (!this.known[names[i]]) { // tabwise ups
				var def = firstMatch(this.constraints, function(c) {
						return c.what.indexOf(names[i]) !== -1;
					}),
					parents = this.graph.to[names[i]], // is name enough?
					tab = this.select(parents).setLength(def.maxlen).addCol(def.what, def.as);
				
				setpush(this.tables, tab);
				for (var j = 0; j < def.what.length; j++)
					this.known[def.what[j]] = true;
			}
		}
		
		// select best tables
		var tabs = [];
		while (names.length > 0) {
			var bestRate = 0, 
				tab = null;
			for (var i = 0; i < this.tables.length && bestRate < names.length; i++) {
				var rate = interPower(this.tables[i].schema(), names);
				if (rate > bestRate) {
					bestRate = rate;
					tab = this.tables[i];
				}
			}
			tabs.push(tab);
			names = setMinus(names, tab.schema());
		}
		
		// multiply
		var temp = tabs[0];
		for (var i = 1; i < tabs.length; i++) {
			temp = temp.times(tabs[i]);
			this.tables.push(temp);
		}
		
		return temp;
	};
		
	Database.prototype.prepare = function() {
		// Inline explicits into implicits where possible.
		// Group CCs.
	};
	
			
	_G.Database = Database;
}(this));