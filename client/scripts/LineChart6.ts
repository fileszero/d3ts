import * as d3 from "d3";
import * as df from "date-fns";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { getSeconds } from "date-fns";

namespace LineChart6 {
    d3.select("body").append("p")
        .text("Zoom and Brush in d3 https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172");

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
        constructor(src: Margin) {
            this.top = src.top;
            this.right = src.right;
            this.bottom = src.bottom;
            this.left = src.left;
        }
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
    function getSize(svg: Selection<BaseType, {}, HTMLElement, any>): Size {
        const svgSize: Size = { width: parseInt(svg.attr("width")), height: parseInt(svg.attr("height")) };
        return svgSize;
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
    class LineSeries {
        public canvas: Selection<BaseType, {}, HTMLElement, any>;
        public generator: Line<Rec>;
        public data: Rec[];
    }
    class Chart {
        public chart: Selection<BaseType, {}, HTMLElement, any>;
        public plotArea: Selection<BaseType, {}, HTMLElement, any>;
        public xScale: ScaleTime<number, number>;
        public size: Size;
        public margin: Margin;
        public xAxis: d3.Axis<number | Date | { valueOf(): number; }>;
        public xAxisArea: Selection<BaseType, {}, HTMLElement, any>;
        public series: LineSeries[] = [];
    }
    let ChartId: number = 0;
    function CreateChart(data: Rec[][], svg: Selection<BaseType, {}, HTMLElement, any>, chartMargin: Margin): Chart {
        ChartId++;
        const result: Chart = new Chart();
        result.margin = new Margin(chartMargin);
        var colors = d3.scaleOrdinal(d3.schemeCategory20);  // 20色を指定
        const svgSize = getSize(svg);
        // Setting up Size
        result.size = getContentsSize(svgSize, chartMargin);
        result.chart = svg
            .append("g")
            .attr("class", "chart")
            .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
        result.plotArea = result.chart.append("g")
            .attr("clip-path", "url(#clip" + ChartId + ")")
            .attr("class", "plotArea");

        result.plotArea.append("clipPath")  // プロットエリアからはみ出さないようにする
            .attr("id", "clip" + ChartId)
            .append("rect")
            .attr("width", result.size.width)
            .attr("height", result.size.height);

        // Set the ranges 出力（描画）の範囲
        result.xScale = d3.scaleTime().range([0, result.size.width]);
        // xの値範囲
        result.xScale.domain(<[Date, Date]>d3.extent(data[0], (d) => d.time));

        // Add the X Axis
        result.xAxis = d3.axisBottom(result.xScale);
        result.xAxisArea = result.chart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + result.size.height + ")")
            .call(<any>result.xAxis);

        for (let i = 0; i < data.length; i++) {
            const yScale = d3.scaleLinear().range([result.size.height, 0]);    // Yの描画範囲
            // Define the line
            const line = d3.line<Rec>()
                .x((d) => { return result.xScale(d.time) })
                .y((d) => { return yScale(d.value) });

            // Scale the range of the data 入力値の範囲
            // 0 が真ん中に来るようにする
            const max = d3.max(data[i], (d) => Math.abs(d.value)) || 0;
            yScale.domain([-max, max]);

            const graph = result.plotArea.append("path")
                // .attr("class", "line")
                .attr("stroke", colors(i.toString()))
                .attr("d", <any>line(data[i]));

            result.series.push(
                { data: data[i], generator: line, canvas: graph }
            );
            // Add the Y Axis
            const yaxis_g = result.chart.append("g")
                .attr("class", "axis")
                .attr("stroke", colors(i.toString()));
            if (i == 0) {
                yaxis_g
                    .call(<any>d3.axisLeft(yScale));
            } else {
                const x_offset = result.size.width + ((i - 1) * 20)
                yaxis_g.attr("transform", "translate( " + x_offset + ", 0 )")   //
                    .call(<any>d3.axisRight(yScale));
            }
        }
        return result;
    }
    function DrawChart(): void {
        const listData: Rec[][] = [];
        for (let i = 0; i < 3; i++) {
            listData.push(createData("Rec" + i));
        }
        // http://bl.ocks.org/d3noob/e34791a32a54e015f57d
        // https://bl.ocks.org/d3noob/814a2bcb3e7d8d8db74f36f77c8e6b7f
        // https://bl.ocks.org/d3noob/755a069aafbe66f3fd8497b9498df643  <= V4!

        const svgSize: Size = { width: 960, height: 500 };

        // Setting up Margins
        const yaxis_width = 20 * listData.length; //Y軸メモリ分確保
        const mainMargin: Margin = { top: 10, right: 10 + yaxis_width, left: 70, bottom: 140 };
        const subMargin: Margin = { top: 400, right: 10 + yaxis_width, bottom: 40, left: 70 };

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
                series.canvas.attr("d", <any>series.generator(series.data));
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
                series.canvas.attr("d", <any>series.generator(series.data));
            }
            main.xAxisArea.call(<any>main.xAxis);
            RangeSelecterUI.call(<any>brush.move, main.xScale.range().map(t.invertX, t));
        }
    }
    DrawChart();
}