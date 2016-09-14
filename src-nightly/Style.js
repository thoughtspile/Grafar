import { global } from './contextBusterHack';

var _G = global.grafar,
	Color = global.Color,
	THREE = global.THREE,
	isExisty = _G.isExisty,
	config = _G.config,
	makeID = _G.makeID;

var styles = {};


function Style(init) {
	init = init || {};

	this.id = init.id || makeID(styles);
	styles[this.id] = this;

	this.alpha = null;
	this.start = null;
	this.end = null;

	this.points = null;
	this.radius = null;

	this.lines = null;

	this.palette = [];
	this.colors = {};
	this.materials = {};

	this.update(init);
	this.samplePalette(init.paletteSize);

	return this;
}

Style.randColor = function() {
    var rgb = Color.convert({
            l: 60,
            a: -100 + Math.floor(200 * Math.random()),
            b: -100 + Math.floor(200 * Math.random())
        }, 'rgb');
    return new THREE.Color('rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
};

Style.constantColor = function(r, g, b) {
	return function(color, data, l) {
		for (var i = 0; i < l; i++) {
			color[i * 3] = r;
			color[i * 3 + 1] = g;
			color[i * 3 + 2] = b;
		}
	}
};

Style.matHelper = function(type, col) {
	console.log('style.matHelper');
    if (!isExisty(col))
        col = Style.randColor();
    if (type === 'point')
        return new THREE.PointCloudMaterial({
            size: config.particleRadius,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: false,
			vertexColors: THREE.VertexColors
            //color: col
        });
    else if (type === 'line')
        return new THREE.LineBasicMaterial({
            //color: col
			vertexColors: THREE.VertexColors
        });
    else if (type === 'mesh')
        return new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            opacity: .5,
            depthWrite: false,
			vertexColors: THREE.VertexColors
            //color: col
            //depthTest: false
        });
};


Style.prototype.update = function(styleChanges) {
	Object.getOwnPropertyNames(styleChanges || {}).forEach(function(name) {
		if (this.hasOwnProperty(name))
			this[name] = styleChanges[name];
	}.bind(this));

	return this;
};


_G.styles = styles;
_G.Style = Style;