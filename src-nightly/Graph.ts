import { resizeBuffer } from './glUtils';
import { Buffer, blockRepeat } from './arrayUtils';
import { GraphBuffer, emptyGraph, pathGraph, cartesianGraphProd, makeFaces } from './topology';
import { nunion } from './setUtils';
import { Reactive } from './Reactive';
import * as _ from 'lodash';
import { makeID } from './utils';

export class TopoRegistry {
    static free(edges, data) {
        const id = makeID();
        return new Reactive([{ id, edges: null, length: 0 }])
            .lift(([ edges, data ], self) => {
                self[0].edges = edges;
                self[0].length = data.length;
            })
            .bind([ edges, data ]);
    }

    static derive(bases) {
        return new Reactive([])
            .lift(src => _.union.apply(_, src).sort((a, b) => a.id.localeCompare(b.id)))
            .bind(bases);
    }
}

export class Graph {
    constructor() {}

    data = new Reactive(new Buffer());
    edges = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    faces = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    colors = new Reactive(new Buffer());
    base = TopoRegistry.free(this.edges, this.data);

    private contextify(targetBase) {
        return new Reactive(new Buffer()).lift((par, out) => {
            const data = par[0];
            const colBase = par[1];
            const targetBase = par[2];
            const totalLength = targetBase
                .map(item => item.length)
                .reduce((prod, len) => prod * len, 1);
            let blockSize = 1;
            let len = data.length;

            resizeBuffer(out, totalLength);
            const res = out.array;
            res.set(data.array);

            targetBase.forEach(base => {
                if (colBase.indexOf(base) === -1) {
                    blockRepeat(
                        res,
                        blockSize,
                        Math.floor(len / blockSize),
                        base.length,
                        res
                    );
                    len *= base.length;
                }
                blockSize *= base.length;
            });
        }).bind([ this.data, this.base, targetBase ]);
    }

    static unify(cols: Graph[]) {
        const targetBase = TopoRegistry.derive(cols.map(col => col.base));

        const baseEdges = new Reactive([])
            .lift(([ bases ], targ) => bases.map(base => base.edges))
            .bind([ targetBase ]);

        const targetEdges = new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift((arr, targ) => cartesianGraphProd(arr[0], targ))
            .bind([ baseEdges ]);
        const targetFaces = new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift((arr, targ) => makeFaces(arr[0], targ))
            .bind([ baseEdges ]);

        return cols.map(col => {
            const unified = new Graph();

            unified.data = col.contextify(targetBase);
            unified.base = targetBase;
            unified.edges = targetEdges;
            unified.faces = targetFaces;
            
            return unified;
        });
    }
}
