import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

import { Layout, File, LineSeriesData, PlotData, ZoomableLineChart, Svg, LineChart, Circle } from "../../src/";

import * as queryString from 'query-string';

namespace LineChart9 {
    /** entry point */
    (async () => {
        const svgSize = new Layout.Size({ width: 960, height: 500 });
        const svg = new Svg("#chart", svgSize);
        const circle = new Circle();
        svg.addParts(circle);
        svg.draw(500);
    })();
}