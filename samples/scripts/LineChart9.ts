import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

import * as d3ts from "../../src/";

import * as queryString from 'query-string';

namespace LineChart9 {
    /** entry point */
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    //構造を構築
    const svgSize = new d3ts.Layout.Size({ width: 960, height: 500 });
    const svg = new d3ts.Svg("#chart", svgSize);
    const objs = 18;
    const circles: d3ts.Circle[] = [];
    const paths: d3ts.Path<d3ts.PlotData<number>>[] = [];
    const texts: d3ts.Text[] = [];
    for (let i = 0; i < objs; i++) {
        const circle = new d3ts.Circle();
        circles.push(circle);
        svg.append(circle);

        const path = new d3ts.Path<d3ts.PlotData<number>>((d) => d.x || 0, (d) => d.y || 0);
        paths.push(path);
        path.attr.stroke = color(i + "");
        svg.append(path);

        const text = new d3ts.Text();
        texts.push(text);
        svg.append(text);

    }
    let loops = 0;

    function x(i: number, size: number = 60) {
        var rad = i * (360 / objs) * (Math.PI / 180);
        var rad2 = loops * (360 / objs) * (Math.PI / 180);
        const pos = Math.sin(rad);
        const pos2 = Math.sin(rad2);
        return (pos * size * pos2) + (size * 2);
    }
    function y(i: number, size: number = 60) {
        var rad = i * (360 / objs) * (Math.PI / 180);
        var rad2 = loops * (360 / objs) * (Math.PI / 180);
        const pos = Math.cos(rad);
        const pos2 = Math.cos(rad2);
        return (pos * size * pos2) + (size * 2);
    }

    function loop() {
        loops++;
        let i = loops;
        for (let circle of circles) {
            i++;
            const data: d3ts.CircleAttr = <d3ts.CircleAttr>{
                cx: x(i),
                cy: y(i),
                r: 5,
                fill: color((i - loops) + "")
            };
            circle.loadData([data]);
        }
        //i = loops;
        for (let path of paths) {
            i++;
            const data: d3ts.PlotData<number>[] = [];
            for (let j = 0; j < objs; j++) {
                data.push({
                    x: x(i) + x(j, j),
                    y: y(i) + y(j, j),
                })
            }
            path.loadData(data);
            path.attr.stroke = color((i - loops) + "")
        }
        i = loops;
        for (let text of texts) {
            i++;
            text.attr.x = x(i);
            text.attr.y = y(i);
            text.loadData([(i - loops).toString()]);
            text.attr.stroke = color((i - loops) + 1 + "")
        }
        svg.draw(500);
    }

    setInterval(loop, 500);
}