import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

import { Layout, Charts } from "../Models";

namespace LineChart7 {
    d3.select("body").append("p")
        .text("Zoom and Brush in d3 https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172");

    function createData(Name: string): Charts.LineSeriesData<Date> {
        // 時系列データ作成
        const today = df.startOfDay(new Date());
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

    function CreateChart(data: Charts.LineSeriesData<Date>[], svg: Selection<BaseType, {}, HTMLElement, any>, chartMargin: Layout.Margin): Charts.LineChart<Date> {
        const result = new Charts.LineChart<Date>(svg, chartMargin);
        result.LoadData(data);
        return result;
    }
    function DrawChart(): void {
        const listData: Charts.LineSeriesData<Date>[] = [];
        for (let i = 0; i < 3; i++) {
            listData.push(createData("Rec" + i));
        }
        // http://bl.ocks.org/d3noob/e34791a32a54e015f57d
        // https://bl.ocks.org/d3noob/814a2bcb3e7d8d8db74f36f77c8e6b7f
        // https://bl.ocks.org/d3noob/755a069aafbe66f3fd8497b9498df643  <= V4!

        const svgSize: Layout.Size = { width: 960, height: 500 };

        // Setting up Margins
        const yaxis_width = 20 * listData.length; //Y軸メモリ分確保
        const mainMargin: Layout.Margin = { top: 10, right: 10 + yaxis_width, left: 70, bottom: 140 };
        const subMargin: Layout.Margin = { top: 400, right: 10 + yaxis_width, bottom: 40, left: 70 };

        // Adds the svg canvas
        const svg = d3.select("body")
            .append("svg")
            .attr("width", svgSize.width)
            .attr("height", svgSize.height);

        const main = CreateChart(listData, svg, mainMargin);
        const sub = CreateChart(listData, svg, subMargin);




        /// サブチャートに範囲選択UIを追加
        var brush = d3.brushX()
            .extent([[0, 0], [sub.size.width, sub.size.height]])
            .on("brush end", brushed);

        const RangeSelecterUI = sub.chart.append("g")
            .attr("class", "brush")
            .call(<any>brush)
            //.call(<any>brush.move, main.xScale.range());  //全範囲選択
            ;


        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [main.size.width, main.size.height]])
            .extent([[0, 0], [main.size.width, main.size.height]])
            .on("zoom", zoomed);

        const ZoomUI = svg.append("rect")
            .attr("class", "zoom")
            .attr("width", main.size.width)
            .attr("height", main.size.height)
            .attr("transform", "translate(" + main.margin.left + "," + main.margin.top + ")")
            .call(<any>zoom);
        ;
        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            // console.log("brushed");
            var s = d3.event.selection || sub.xScale.range();
            const newXDomain = s.map(sub.xScale.invert, sub.xScale);
            main.xScale.domain(newXDomain);
            for (const series of main.series) {
                series.canvas.attr("d", <any>main.lineGenerator(series.data.data));
            }
            main.xAxisArea.call(<any>main.xAxis);

            ZoomUI.call(<any>zoom.transform, d3.zoomIdentity
                .scale(main.size.width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            // console.log("zoomed");
            var t = d3.event.transform;
            main.xScale.domain(t.rescaleX(sub.xScale).domain());
            for (const series of main.series) {
                series.canvas.attr("d", <any>main.lineGenerator(series.data.data));
            }
            main.xAxisArea.call(<any>main.xAxis);
            RangeSelecterUI.call(<any>brush.move, main.xScale.range().map(t.invertX, t));
        }
    }
    DrawChart();
}