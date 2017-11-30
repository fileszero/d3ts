import * as d3 from "d3";
import * as df from "date-fns";

namespace LineChart {
    d3.select("body").append("p")
        .text("Sample 3 Line Chart https://dev.classmethod.jp/client-side/javascript/d3-js_linechart_and_barchart/");

    class Rec {
        public Name: string;
        public time: Date;
        public value: number;
    }
    function createData(Name: string): Rec[] {
        // 時系列データ作成
        const today = df.startOfDay(new Date());
        const listData: Rec[] = [];
        let seed = 0;
        for (let time = today; time.getDay() === today.getDay(); time = df.addMinutes(time, 1)) {
            const rec = new Rec();
            listData.push(rec);
            rec.Name = "Rec1";
            rec.time = time;
            seed += (Math.random() - 0.5);
            rec.value = seed;
        }
        return listData;
    }
    function DrawChart(): void {
        const listData0 = createData("Rec0");
        const listData1 = createData("Rec1");
        // http://bl.ocks.org/d3noob/e34791a32a54e015f57d
        // https://bl.ocks.org/d3noob/814a2bcb3e7d8d8db74f36f77c8e6b7f
        // https://bl.ocks.org/d3noob/755a069aafbe66f3fd8497b9498df643  <= V4!

        var margin = { top: 30, right: 40, bottom: 30, left: 50 },
            width = 600 - margin.left - margin.right,
            height = 270 - margin.top - margin.bottom;

        var parseDate = d3.timeParse("%d-%b-%y"); // https://github.com/d3/d3/blob/master/CHANGES.md#time-formats-d3-time-format


        // Set the ranges 出力（描画）の範囲
        const x = d3.scaleTime().range([0, width]);
        const y0 = d3.scaleLinear().range([height, 0]);
        const y1 = d3.scaleLinear().range([height, 0]);

        // Define the line
        const line0 = d3.line<Rec>()
            .x((d) => { return x(d.time) })
            .y((d) => { return y0(d.value) });

        const line1 = d3.line<Rec>()
            .x((d) => { return x(d.time) })
            .y((d) => { return y1(d.value) });

        // Adds the svg canvas
        const svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add the X Axis
        const xAxis = d3.axisBottom(x);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(<any>xAxis);

        // Scale the range of the data 入力値の範囲
        // 0 が真ん中に来るようにする
        x.domain(<[Date, Date]>d3.extent(listData1, (d) => d.time));
        const max0 = d3.max(listData0, (d) => Math.abs(d.value)) || 0;
        y0.domain([-max0, max0]);
        const max1 = d3.max(listData1, (d) => Math.abs(d.value)) || 0;
        y1.domain([-max1, max1]);


        svg.append("path")
            .attr("class", "line")
            .attr("d", <any>line0(listData0));

        svg.append("path")
            .attr("class", "line")
            .attr("d", <any>line1(listData1));

        // Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(<any>d3.axisLeft(y0));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate( " + width + ", 0 )")
            .call(<any>d3.axisRight(y1));
    }
    DrawChart();
}