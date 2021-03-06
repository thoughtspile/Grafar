import { GraphBuffer } from './GraphBuffer';
import { incArray, arrayTimes } from '../../array/ArrayUtils';
import { Pool } from '../../array/Pool';

/**
 * cartesianGraphProd декартово произведение n графов. (https://en.wikipedia.org/wiki/Cartesian_product_of_graphs)
 *   Задает топологию декартова произведения двух измерений.
 *   Например, декартово произведение двух отрезков -- сетка, а отрезка и дискретного множества -- набор отрезков.
 *
 * @param  {GraphBuffer[]} src графы, которые перемножаем
 * @param  {GraphBuffer} target куда положить результат
 * @return {void}
 *
 * TODO: как минимум, нужно выделять массивы не через конструктор, а брать в Pool.
 * TODO: в идеальном мире нужно явным образом обобщить алгоритм на n графов, а редьюсить по два.
 */
export function cartesianGraphProd(src: GraphBuffer[], target: GraphBuffer) {
    const accum = new GraphBuffer(2, 1);
    target.desc = src.map(g => g.desc).join('');

    // редьюсим
    for (var i = 0; i < src.length; i++) {
        cartesianGraphProd2([accum, src[i]], accum);
    }

    // перекладываем в target
    GraphBuffer.resize(target, accum.count);
    target.array.set(accum.array);
    target.pointCount = accum.pointCount;
};

/**
 * cartesianGraphProd2: декартово произведение двух графов. (https://en.wikipedia.org/wiki/Cartesian_product_of_graphs)
 *   Задает топологию декартова произведения двух измерений.
 *   Например, декартово произведение двух отрезков -- сетка, а отрезка и дискретного множества -- набор отрезков.
 *
 * @param  {[GraphBuffer, GraphBuffer]} src массив из двух GraphBuffer-ов, которые перемножаем
 * @param  {type} target куда кладем результат
 * @return {void}
 *
 * TODO: нужно выделять массивы не через конструктор, а брать в Pool
 * TODO: не уверен, но, возможно, операции на графах не реактивны, то есть нельзя динамически менять размер (количество точек) и топологию объектов.
 */
function cartesianGraphProd2(src: [GraphBuffer, GraphBuffer], target: GraphBuffer) {
    const arr1 = src[0].array;
    const edgeCount1 = src[0].count;
    const nodeCount1 = src[0].pointCount;

    const arr2 = src[1].array;
    const edgeCount2 = src[1].count;
    const nodeCount2 = src[1].pointCount;

    if (target.itemSize !== 2) {
        throw new Error(`Invalid itemSize of segment index array: expected 2, got ${ target.itemSize }`);
    }

    GraphBuffer.resize(target, (edgeCount1 * nodeCount2 + edgeCount2 * nodeCount1));
    target.pointCount = nodeCount1 * nodeCount2;

    let pos = 0;
    let buffer1 = new Uint32Array(arr1);
    for (let i = 0; i < nodeCount2; i++, pos += 2 * edgeCount1) {
        target.array.set(buffer1, pos);
        incArray(buffer1, nodeCount1);
    }

    let buffer2 = new Uint32Array(arr2);
    arrayTimes(nodeCount1, buffer2, buffer2);
    for (let i = 0; i < nodeCount1; i++, pos += 2 * edgeCount2) {
        target.array.set(buffer2, pos);
        incArray(buffer2, 1);
    }
};
