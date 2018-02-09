import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

import { Layout, LineSeriesData, PlotData, ZoomableLineChart, Svg } from "../../src";

namespace LineChart7 {
    d3.select("body").append("p")
        .text("Zoom and Brush in d3 https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172");

    function createData(Name: string, date: Date, scale: number = 1): LineSeriesData<Date> {
        // 時系列データ作成
        const today = df.startOfDay(date);
        const listData = new LineSeriesData<Date>();
        listData.name = Name;
        let y = 0;
        for (let time = today; time.getDay() === today.getDay(); time = df.addMinutes(time, 1)) {
            const rec = new PlotData<Date>();
            listData.data.push(rec);
            y += (Math.random() - 0.5);
            rec.x = time;
            rec.y = y * scale;

        }
        listData.yAxis = Name;
        return listData;
    }

    function DrawChart(): ZoomableLineChart<Date> {
        const listData: LineSeriesData<Date>[] = [];
        for (let i = 0; i < 3; i++) {
            let data = createData("Rec" + i, new Date());
            data.width = i + 1;
            listData.push(data);
        }
        // http://bl.ocks.org/d3noob/e34791a32a54e015f57d
        // https://bl.ocks.org/d3noob/814a2bcb3e7d8d8db74f36f77c8e6b7f
        // https://bl.ocks.org/d3noob/755a069aafbe66f3fd8497b9498df643  <= V4!

        const svgSize = new Layout.Size({ width: 960, height: 500 });


        // Adds the svg canvas
        const svg = new Svg("#chart", svgSize);

        // const svg = d3.select("body")
        //     .append("svg")
        //     .attr("width", svgSize.width)
        //     .attr("height", svgSize.height);

        // Setting up Margins
        const yaxis_width = 20 * listData.length; //Y軸メモリ分確保
        const margin = new Layout.Margin({ top: 10, right: 10 + yaxis_width, left: 70, bottom: 40 });

        const chart = new ZoomableLineChart<Date>(svg.size, margin);
        svg.append(chart);
        chart.loadData(listData);
        svg.draw();
        return chart;

    }
    const chart = DrawChart();
    setTimeout(() => {
        const listData: LineSeriesData<Date>[] = [];
        for (let i = 0; i < 3; i++) {
            listData.push(createData("Rec" + i, new Date(), 10));
            listData.push(createData("Rec" + i, df.addDays(new Date(), 1), 2));
        }
        chart.loadData(listData);
        chart.draw();
    }, 2000);

    setTimeout(() => {
        const listData: LineSeriesData<Date>[] = [];
        for (let i = 0; i < 5; i++) {
            listData.push(createData("Rec" + i, new Date(), 3));
        }
        chart.loadData(listData);
        chart.draw();
    }, 4000);

}