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
        const listData1 = createData("Rec1");
        const listData2 = createData("Rec1");
        // http://bl.ocks.org/d3noob/e34791a32a54e015f57d
        // https://bl.ocks.org/d3noob/755a069aafbe66f3fd8497b9498df643  <= V4!

        var margin = { top: 30, right: 40, bottom: 30, left: 50 },
            width = 600 - margin.left - margin.right,
            height = 270 - margin.top - margin.bottom;

        var parseDate = d3.timeParse("%d-%b-%y"); // https://github.com/d3/d3/blob/master/CHANGES.md#time-formats-d3-time-format


        // Set the ranges 出力（描画）の範囲
        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        // Define the line
        const line = d3.line<Rec>()
            .x((d) => { return x(d.time) })
            .y((d) => { return y(d.value) });

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
        x.domain(<[Date, Date]>d3.extent(listData1, (d) => d.time));
        y.domain(<[number, number]>d3.extent(listData1.concat(listData2), function (d) { return d.value; }));


        svg.append("path")
            .attr("class", "line")
            .attr("d", <any>line(listData1));

        svg.append("path")
            .attr("class", "line")
            .attr("d", <any>line(listData2));

        // Add the Y Axis
        const yAxis = d3.axisLeft(y);
        svg.append("g")
            .attr("class", "axis")
            .call(<any>yAxis);
    }
    DrawChart();
}