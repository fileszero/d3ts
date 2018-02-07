import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

import { Layout, File, LineSeriesData, PlotData, ZoomableLineChart, Svg, LineChart, ChartParts } from "../../src/";

import * as queryString from 'query-string';

namespace LineChart8 {
    d3.select("body").append("p")
        .text("Zoom and Brush in d3 https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172");

    const urlParams = queryString.parse(location.search);
    console.log(urlParams);

    const datePerser = d3.timeParse(urlParams.df || "%b-%Y");

    async function readData(): Promise<LineSeriesData<Date>[]> {
        const data: LineSeriesData<Date>[] = [];
        var filepath = urlParams.f || "./sp500mcol.csv";;
        const csv = await File.csvText(filepath);

        for (let field in csv[0]) {
            if (field != "date") {
                const listData = new LineSeriesData<Date>();
                listData.name = field;
                //listData.yAxis = "default";
                if (field == "price") {
                    listData.yAxis = "price";
                    listData.width = 3;
                } else {
                    listData.yAxis = "calc";
                }
                data.push(listData);
            }
        }
        for (let row of csv) {
            //console.log(row);
            const x = datePerser(row["date"] || "");
            if (!x) continue;
            for (const series of data) {
                const rec = new PlotData<Date>();
                rec.x = x;
                rec.y = parseFloat(row[series.name] || "");
                series.data.push(rec);
            }
        }
        return data;
    }
    async function DrawChart(): Promise<ChartParts> {
        const listData = await readData();

        const string_result = document.getElementById("string_result");
        if (string_result) {
            string_result.innerText = JSON.stringify(listData);
        }
        // http://bl.ocks.org/d3noob/e34791a32a54e015f57d
        // https://bl.ocks.org/d3noob/814a2bcb3e7d8d8db74f36f77c8e6b7f
        // https://bl.ocks.org/d3noob/755a069aafbe66f3fd8497b9498df643  <= V4!

        const svgSize = new Layout.Size({ width: 960, height: 500 });


        // Adds the svg canvas
        // const svg = d3.select("#chart")
        //     .append("svg")
        //     .attr("width", svgSize.width)
        //     .attr("height", svgSize.height);

        const svg = new Svg("#chart", svgSize);

        // Setting up Margins
        const yaxis_width = 20 * listData.length; //Y軸メモリ分確保
        const margin = new Layout.Margin({ top: 10, right: 10 + yaxis_width, left: 70, bottom: 40 });


        const chart = new LineChart<Date>(svg.size, margin);  //ZoomableLineChart
        svg.addParts(chart);
        chart.loadData(listData);
        svg.draw(500);
        return chart;

    }
    /** entry point */
    (async () => {
        const chart = await DrawChart();

    })();
}