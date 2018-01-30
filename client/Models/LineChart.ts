import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { Layout } from "./layout"
import { YAxisDef } from "./AxisDef"
import { LineSeriesData, PlotData } from "./data";

export class LineChart<Tx extends number | Date> {
    public chart: Selection<BaseType, {}, HTMLElement, any>;
    public plotArea: Selection<BaseType, {}, HTMLElement, any>;
    /** xの描画範囲 */
    public xScale: ScaleTime<number, number>;
    /** */
    public size: Layout.Size;
    public margin: Layout.Margin;
    public xAxis: d3.Axis<number | Date | { valueOf(): number; }>;
    public xAxisArea: Selection<BaseType, {}, HTMLElement, any>;
    public yAxisAreaLeft: Selection<BaseType, {}, HTMLElement, any>;
    public yAxisAreaRight: Selection<BaseType, {}, HTMLElement, any>;
    protected yAxisDefs: YAxisDef[] = [];

    protected colors: d3.ScaleOrdinal<string, string>;

    protected static ChartId = 0;
    constructor(container: Selection<BaseType, {}, HTMLElement, any>, chartMargin: Layout.Margin) {
        LineChart.ChartId++;
        this.colors = d3.scaleOrdinal(d3.schemeCategory20);  // 20色を指定

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


        // Add the X Axis
        this.xAxis = d3.axisBottom(this.xScale);
        this.xAxisArea = this.chart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.size.height + ")");
        // .call(<any>this.xAxis);

        this.yAxisAreaLeft = this.chart.append("g")
            .attr("class", "axis axis--y--l");

        this.yAxisAreaRight = this.chart.append("g")
            .attr("class", "axis axis--y--r")
            .attr("transform", "translate( " + this.size.width + ", 0 )")   //
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

    public getLine(lineData: LineSeriesData<Tx>, idx: number): string {
        let yaxis = this.yAxisDefs.filter((ax) => ax.name === lineData.yAxis)[0];
        // Scale the range of the data 入力値の範囲
        // 0 が真ん中に来るようにする
        const y_ext = d3.max(lineData.data, (d) => Math.abs(d.y)) || 0;

        // Define the line
        const generator = d3.line<PlotData<Tx>>()
            .x((d, i) => { return this.xScale(d.x) })
            .y((d, i) => { return yaxis.scale(d.y) });

        return generator(lineData.data) || "";
    }

    protected DrawXAxis(data: LineSeriesData<Tx>[]) {
        this.xScale.domain(this.xExtent(data)); // x入力値の範囲
        this.xAxis = d3.axisBottom(this.xScale);
        this.chart.select(".axis--x").call(<any>this.xAxis);
    }

    protected DrawYAxis(yaxis: YAxisDef) {
        yaxis.height = this.size.height;
        yaxis.color = this.colors(yaxis.index.toString())
        const yaxis_g = this.chart.append("g")
            .attr("class", yaxis.className)
            .attr("stroke", yaxis.color);
        if (yaxis.index === 0) {
            yaxis.axis = d3.axisLeft(yaxis.scale);
        } else {
            yaxis.axis = d3.axisRight(yaxis.scale);
            const x_offset = this.size.width + ((yaxis.index - 1) * 20)
            yaxis_g.attr("transform", "translate( " + x_offset + ", 0 )")
        }
        this.chart.select("." + yaxis.className)
            .transition().duration(500)
            .call(<any>yaxis.axis);
    }
    public LoadData(data: LineSeriesData<Tx>[]) {
        this.DrawXAxis(data);

        const axis_keys = data.map((d) => d.yAxis).filter((k, i, arr) => arr.indexOf(k) === i); //y軸名一覧(distinct)
        for (const yaxis of this.yAxisDefs) {   // 使われてないｙ軸を削除
            if (axis_keys.indexOf(yaxis.name) >= 0) continue;
            // 削除
            this.chart.selectAll("." + yaxis.className).remove();
        }
        for (const axis_key of axis_keys) { // y軸再定義
            let yaxis = this.yAxisDefs.filter((ax) => ax.name === axis_key)[0];
            if (!yaxis) {   //初回
                const axis_idx = axis_keys.indexOf(axis_key)
                yaxis = new YAxisDef(axis_key, axis_idx)
                this.yAxisDefs.push(yaxis);
            }
            //domain 評価
            const ydatas = data.filter((d) => d.yAxis === axis_key);
            for (const ydata of ydatas) {
                yaxis.domain(ydata.data.map((d) => d.y));
            }
            this.DrawYAxis(yaxis);

            //const grp = data.filter((d) => d.yAxis === axis_key);
            // Scale the range of the data 入力値の範囲
            // 0 が真ん中に来るようにする
            //const y_ext = d3.max(grp, (ds) => d3.max(ds.data, (d) => Math.abs(d.y))) || 0;
            // yaxis.scale.domain([-y_ext, y_ext]);

        }


        // color
        let i = 0;
        for (const series of data) {
            if (!series.color) {
                series.color = this.colors(i.toString());
            }
            i++;
        }
        // https://stackoverflow.com/questions/34088550/d3-how-to-refresh-a-chart-with-new-data
        // New data should be added to pie using enter()
        // http://bl.ocks.org/alansmithy/e984477a741bc56db5a5
        // http://tech.nitoyon.com/ja/blog/2013/10/24/d3js/
        // https://shimz.me/blog/d3-js/2619 超基本！ コンソールでselect,data,enterメソッドを理解する。

        //rejoin data データのバインドを開始
        const graph = this.plotArea.selectAll("path").data<LineSeriesData<Tx>>(data);
        //remove unneeded path
        graph.exit().remove();

        // データの数だけ、d3オブジェクトを作成
        graph.enter()
            .append("path") //create any new path needed // データをバインドし、要素を追加(この時点で初めてDOMにタグが挿入)
            .attr("class", "series")   // バインドされたデータを使用して要素を操作
            .attr("stroke", (d, i) => d.color)
            .style("stroke-width", (d, i) => d.width) // 線の太さを決める
            .attr("d", (d, i) => this.getLine(d, i))
            ;

        // redraw exist path
        graph
            .transition().duration(500)
            .attr("d", (d, i) => this.getLine(d, i));

        // and old data should be removed using exit().remove()
        // graph.transition().delay(500).duration(1000)

    }
}
