import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

import { Layout, Charts } from "../Models";

namespace LineChart7 {
    d3.select("body").append("p")
        .text("Zoom and Brush in d3 https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172");

    function createData(Name: string, date: Date): Charts.LineSeriesData<Date> {
        // 時系列データ作成
        const today = df.startOfDay(date);
        const listData = new Charts.LineSeriesData<Date>();
        listData.name = Name;
        let y = 0;
        for (let time = today; time.getDay() === today.getDay(); time = df.addMinutes(time, 1)) {
            const rec = new Charts.PlotData<Date>();
            listData.data.push(rec);
            y += (Math.random() - 0.5);
            rec.x = time;
            rec.y = y;
        }
        return listData;
    }

    function DrawChart(): Charts.ZoomableLineChart<Date> {
        const listData: Charts.LineSeriesData<Date>[] = [];
        for (let i = 0; i < 3; i++) {
            listData.push(createData("Rec" + i, new Date()));
        }
        // http://bl.ocks.org/d3noob/e34791a32a54e015f57d
        // https://bl.ocks.org/d3noob/814a2bcb3e7d8d8db74f36f77c8e6b7f
        // https://bl.ocks.org/d3noob/755a069aafbe66f3fd8497b9498df643  <= V4!

        const svgSize: Layout.Size = { width: 960, height: 500 };


        // Adds the svg canvas
        const svg = d3.select("body")
            .append("svg")
            .attr("width", svgSize.width)
            .attr("height", svgSize.height);

        // Setting up Margins
        const yaxis_width = 20 * listData.length; //Y軸メモリ分確保
        const margin: Layout.Margin = { top: 10, right: 10 + yaxis_width, left: 70, bottom: 40 };

        const chart = new Charts.ZoomableLineChart<Date>(svg, margin);
        chart.LoadData(listData);
        return chart;

    }
    const chart = DrawChart();
    setTimeout(() => {
        const listData: Charts.LineSeriesData<Date>[] = [];
        for (let i = 0; i < 3; i++) {
            listData.push(createData("Rec2nd" + i, new Date()));
            listData.push(createData("Rec2nd" + 10 + i, df.addDays(new Date(), 1)));
        }
        chart.LoadData(listData);
    }, 3000);

    setTimeout(() => {
        const listData: Charts.LineSeriesData<Date>[] = [];
        for (let i = 0; i < 5; i++) {
            listData.push(createData("Rec3rd" + i, new Date()));
        }
        chart.LoadData(listData);
    }, 6000);

}