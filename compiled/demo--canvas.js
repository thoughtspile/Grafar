'use strict';

var _grafar = require('./grafar');

var grafar = _interopRequireWildcard(_grafar);

var _transforms = require('./transforms');

var _combine = require('./combine');

var _bindMixin = require('./bind-mixin');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var N = 1000;

var ctx = {
    clearRect: function clearRect() {},
    fillRect: function fillRect() {}
};
var canvas = {};
if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

var t = 0;
var x = grafar.range(0, 500, N);
var i = grafar.ints(-2, 2);
var colors = ['#0000ff', '#000088', '#000000', '#880000', '#ff0000'];

var ix = grafar.cart([i, x]);
var itemMap = function itemMap(i, x) {
    return 200 + 200 * Math.sin(Math.sin(t * i) + Math.cos(i + x / 20));
};
var fn = (0, _bindMixin.volatile)(new _transforms.Map([itemMap]).cache(new grafar.Set(1)));
var y = (0, _bindMixin.bind)(function (fn, arg) {
    return fn.arg(arg).exec();
}, fn, ix); // poor design with conext change
var draw = (0, _bindMixin.bind)(function (ix, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // very bad, can't bind zip for deep arg
    (0, _combine.zip)([ix, y]).each(function (i, x, y) {
        ctx.fillStyle = colors[i + 2];
        ctx.fillRect(x, y, 1, 1);
    });
}, ix, y);

[function () {
    return t += .01;
}, draw].forEach(_bindMixin.Tick.on);