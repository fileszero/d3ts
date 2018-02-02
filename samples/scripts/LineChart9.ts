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
    const lines: Path<PlotData<number>>[] = [];
    for (let i = 0; i < 10; i++) {
        const circle = new Circle();
        circles.push(circle);
        svg.addParts(circle);

        const line = new Path<PlotData<number>>((d) => (d.x || 0), (d) => (d.y || 0));
    }

    let loops = 0;
    function loop() {
        let i = loops;
        for (let circle of circles) {
            i++;
            const data: CircleAttr = <CircleAttr>{
                cx: i * 10,
                cy: i * 15,
                r: i * 5,
                fill: color(i + "")
            };
            circle.loadData(data);
        }
        svg.draw(500);
        loops++;
    }

    setInterval(loop, 1000);
}