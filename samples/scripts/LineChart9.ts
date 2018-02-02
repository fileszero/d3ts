import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

import { Layout, File, LineSeriesData, PlotData, ZoomableLineChart, Svg, LineChart, Circle, CircleAttr } from "../../src/";

import * as queryString from 'query-string';

namespace LineChart9 {
    /** entry point */
    (async () => {
        var color = d3.scaleOrdinal(d3.schemeCategory20);
        const svgSize = new Layout.Size({ width: 960, height: 500 });
        const svg = new Svg("#chart", svgSize);
        for (let i = 0; i < 10; i++) {
            const circle = new Circle();
            const data: CircleAttr = <CircleAttr>{ cx: i * 10, cy: i * 15, r: i * 5, fill: color(i) };
            circle.loadData(data);
            svg.addParts(circle);
        }
        svg.draw(500);
    })();
}