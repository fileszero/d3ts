import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color } from "d3";

namespace LineChart {
    d3.select("body").append("p")
        .text("Sample 3 Line Chart https://dev.classmethod.jp/client-side/javascript/d3-js_linechart_and_barchart/");

    class Rec {
        public Name: string;
        public time: Date;
        public value: number;
    }
    class Size {
        public width: number;
        public height: number;
    }
    class Margin {
        public top: number;
        public right: number;
        public bottom: number;
        public left: number;
    }
    function getContentsSize(container: Size, margin: Margin): Size {
        const result: Size = {
            width: container.width - margin.left - margin.right,
            height: container.height - margin.top - margin.bottom
        }
        return result;
    }

    function createData(Name: string): Rec[] {
        // 時系列データ作成
        const today = df.startOfDay(new Date());
        const listData: Rec[] = [];
        let seed = 0;
        for (let time = today; time.getDay() === today.getDay(); time = df.addMinutes(time, 1)) {
            const rec = new Rec();
            listData.push(rec);
            rec.Name = Name;
            rec.time = time;
            seed += (Math.random() - 0.5);
            rec.value = seed;
        }
        return listData;
    }
    function DrawChart(): void {
        const listData: Rec[][] = [];
        for (let i = 0; i < 3; i++) {
            listData.push(createData("Rec" + i));
        }
        // http://bl.ocks.org/d3noob/e34791a32a54e015f57d
        // https://bl.ocks.org/d3noob/814a2bcb3e7d8d8db74f36f77c8e6b7f
        // https://bl.ocks.org/d3noob/755a069aafbe66f3fd8497b9498df643  <= V4!

        const svgSize: Size = { width: 600, height: 270 };
        const svgMargin: Margin = { top: 30, right: 10, bottom: 30, left: 30 };
        svgMargin.right += 20 * listData.length; //Y軸メモリ分確保
        const chartSize = getContentsSize(svgSize, svgMargin);

        var parseDate = d3.timeParse("%d-%b-%y"); // https://github.com/d3/d3/blob/master/CHANGES.md#time-formats-d3-time-format
        var colors = d3.scaleOrdinal(d3.schemeCategory20);  // 20色を指定
        // Adds the svg canvas
        const svg = d3.select("body")
            .append("svg")
            .attr("width", svgSize.width)
            .attr("height", svgSize.height);
        const chart = svg
            .append("g")
            .attr("transform", "translate(" + svgMargin.left + "," + svgMargin.top + ")");

        // Set the ranges 出力（描画）の範囲
        const x = d3.scaleTime().range([0, chartSize.width]);
        // Add the X Axis
        const xAxis = d3.axisBottom(x);
        chart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + chartSize.height + ")")
            .call(<any>xAxis);
        // xの値範囲
        x.domain(<[Date, Date]>d3.extent(listData[0], (d) => d.time));

        for (let i = 0; i < listData.length; i++) {
            const y = d3.scaleLinear().range([chartSize.height, 0]);    // Yの描画範囲
            // Define the line
            const line = d3.line<Rec>()
                .x((d) => { return x(d.time) })
                .y((d) => { return y(d.value) });


            // Scale the range of the data 入力値の範囲
            // 0 が真ん中に来るようにする
            const max = d3.max(listData[i], (d) => Math.abs(d.value)) || 0;
            y.domain([-max, max]);

            chart.append("path")
                // .attr("class", "line")
                .attr("stroke", colors(i.toString()))
                .attr("d", <any>line(listData[i]));

            // Add the Y Axis
            const yaxis_g = chart.append("g")
                .attr("class", "axis")
                .attr("stroke", colors(i.toString()));
            if (i == 0) {
                yaxis_g
                    .call(<any>d3.axisLeft(y));
            } else {
                const x_offset = chartSize.width + ((i - 1) * 20)
                yaxis_g.attr("transform", "translate( " + x_offset + ", 0 )")   //
                    .call(<any>d3.axisRight(y));
            }
        }

    }
    DrawChart();
}