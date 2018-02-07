import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

import { Layout, File, LineSeriesData, PlotData, ZoomableLineChart, Svg, LineChart, Circle, CircleAttr, Path } from "../../src/";

import * as queryString from 'query-string';

namespace LineChart9 {
    /** entry point */
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    //構造を構築
    const svgSize = new Layout.Size({ width: 960, height: 500 });
    const svg = new Svg("#chart", svgSize);
    const circles: Circle[] = [];
    const paths: Path<PlotData<number>>[] = [];
    for (let i = 0; i < 10; i++) {
        const circle = new Circle();
        circles.push(circle);
        svg.addParts(circle);

        const path = new Path<PlotData<number>>((d) => d.x || 0, (d) => d.y || 0);
        paths.push(path);
        path.attr.stroke = color(i + "");
        svg.addParts(path);
    }

    let loops = 0;
    function loop() {
        let i = loops;
        for (let circle of circles) {
            i++;
            const data: CircleAttr = <CircleAttr>{
                cx: i * 10,
                cy: i * 15,
                r: 5,
                fill: color(i + "")
            };
            circle.loadData(data);
        }
        i = loops;
        for (let path of paths) {
            i++;
            const data: PlotData<number>[] = [];
            for (let j = 0; j < 10; j++) {
                data.push()
            }
            path.loadData([{ x: 10 * i + i, y: 10 * i + i }, { x: 10 * i + Math.sin(i), y: 10 * i + i + 10 }, { x: 10 * i + Math.cos(i) * 10, y: 10 * i + i + Math.sin(i) * 10 }]);
            path.attr.stroke = color(i + "")
        }
        svg.draw(500);
        loops++;
    }

    setInterval(loop, 1000);
}