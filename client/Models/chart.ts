import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { Layout } from "./layout"

export namespace Charts {
    export class PlotData<Tx extends number | Date>{
        public x: Tx;
        public y: number;
    }

    export class LineSeriesData<Tx extends number | Date> {
        public name: string;
        public data: PlotData<Tx>[] = [];
    }

    class LineSeriesLine<Tx extends number | Date> {
        public canvas: Selection<BaseType, {}, HTMLElement, any>;
        public data: LineSeriesData<Tx>;
    }

    export class LineChart<Tx extends number | Date> {
        public chart: Selection<BaseType, {}, HTMLElement, any>;
        public plotArea: Selection<BaseType, {}, HTMLElement, any>;
        /** xの描画範囲 */
        public xScale: ScaleTime<number, number>;
        /** yの描画範囲 */
        public yScale: ScaleLinear<number, number>;
        /** */
        public lineGenerator: Line<PlotData<Tx>>;
        public size: Layout.Size;
        public margin: Layout.Margin;
        public xAxis: d3.Axis<number | Date | { valueOf(): number; }>;
        public xAxisArea: Selection<BaseType, {}, HTMLElement, any>;
        public series: LineSeriesLine<Tx>[] = [];

        protected static ChartId = 0;
        constructor(container: Selection<BaseType, {}, HTMLElement, any>, chartMargin: Layout.Margin) {
            LineChart.ChartId++;
            this.margin = new Layout.Margin(chartMargin);
            const svgSize = Layout.getSize(container);
            // Setting up Size
            this.size = Layout.getContentsSize(svgSize, chartMargin);
            //　チャートの全体
            this.chart = container
                .append("g")
                .attr("class", "chart")
                .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

            // 線を引くエリア
            const clip_id = "LineChartclip" + LineChart.ChartId;
            this.plotArea = this.chart.append("g")
                .attr("clip-path", "url(#" + clip_id + ")")
                .attr("class", "plotArea");

            this.plotArea.append("clipPath")  // プロットエリアからはみ出さないようにする
                .attr("id", clip_id)
                .append("rect")
                .attr("width", this.size.width)
                .attr("height", this.size.height);

            // Set the ranges 出力（描画）の範囲
            this.xScale = d3.scaleTime().range([0, this.size.width]);       // xの描画範囲
            this.yScale = d3.scaleLinear().range([this.size.height, 0]);    // Yの描画範囲

            // Define the line
            this.lineGenerator = d3.line<PlotData<Tx>>()
                .x((d) => { return this.xScale(d.x) })
                .y((d) => { return this.yScale(d.y) });

            // Add the X Axis
            this.xAxis = d3.axisBottom(this.xScale);
            this.xAxisArea = this.chart.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + this.size.height + ")")
                .call(<any>this.xAxis);

        }

        /**
         * xの値範囲
         */
        protected xExtent(data: LineSeriesData<Tx>[]): (Tx | 0)[] {
            const min = d3.min(data, (line) => d3.min(line.data, (plot) => plot.x)) || 0;
            const max = d3.max(data, (line) => d3.max(line.data, (plot) => plot.x)) || 0;
            return [min, max];
        }

        /**
         * yの値範囲
         */
        protected yExtent(data: LineSeriesData<Tx>[]): number[] {
            const min = d3.min(data, (line) => d3.min(line.data, (plot) => plot.y)) || 0;
            const max = d3.max(data, (line) => d3.max(line.data, (plot) => plot.y)) || 0;
            return [min, max];
        }
        public LoadData(data: LineSeriesData<Tx>[]) {
            var colors = d3.scaleOrdinal(d3.schemeCategory20);  // 20色を指定

            this.xScale.domain(this.xExtent(data)); // x入力値の範囲

            for (let i = 0; i < data.length; i++) {

                // Scale the range of the data 入力値の範囲
                // 0 が真ん中に来るようにする
                const y_ext = this.yExtent(data)
                this.yScale.domain([-y_ext[1], y_ext[1]]);

                const graph = this.plotArea.append("path")
                    // .attr("class", "line")
                    .attr("stroke", colors(i.toString()))
                    .attr("d", <any>this.lineGenerator(data[i].data));

                this.series.push(
                    { data: data[i], canvas: graph }
                );
                // Add the Y Axis
                const yaxis_g = this.chart.append("g")
                    .attr("class", "axis")
                    .attr("stroke", colors(i.toString()));
                if (i == 0) {
                    yaxis_g
                        .call(<any>d3.axisLeft(this.yScale));
                } else {
                    const x_offset = this.size.width + ((i - 1) * 20)
                    yaxis_g.attr("transform", "translate( " + x_offset + ", 0 )")   //
                        .call(<any>d3.axisRight(this.yScale));
                }
            }

        }
    }

    export class ZoomableLineChart<Tx extends number | Date> {
        protected main: LineChart<Tx>;
        protected sub: LineChart<Tx>;
        constructor(container: Selection<BaseType, {}, HTMLElement, any>, chartMargin: Layout.Margin) {
            const svgSize = Layout.getSize(container);
            const mainMargin = { top: chartMargin.top, right: chartMargin.right, left: chartMargin.left, bottom: chartMargin.bottom + 100 };
            const subMargin = { top: svgSize.height - 100, right: chartMargin.right, left: chartMargin.left, bottom: chartMargin.bottom };
            const main = new Charts.LineChart<Tx>(container, mainMargin);
            const sub = new Charts.LineChart<Tx>(container, subMargin);

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

            const ZoomUI = container.append("rect")
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

            this.main = main;
            this.sub = sub;
        }

        public LoadData(data: LineSeriesData<Tx>[]) {
            this.main.LoadData(data);
            this.sub.LoadData(data);
        }
    }
}