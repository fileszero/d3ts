import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { Legend, Layout, LineSeriesData, PlotData, YAxisDef, XAxisDef, AxisPosition, ChartDataParts } from ".";
import { util } from "./util";

export class LineChart<Tx extends number | Date> implements ChartDataParts<LineSeriesData<Tx>>{
    /** xの描画範囲 */
    // public xScale: ScaleTime<number, number>;
    /** */
    public size: Layout.Size;
    public margin: Layout.Margin;

    // 表示領域
    public canvas: Selection<BaseType, {}, HTMLElement, any>;
    private plotArea: Selection<BaseType, {}, HTMLElement, any>;
    private xAxisArea: Selection<BaseType, {}, HTMLElement, any>;
    private yAxisAreaLeft: Selection<BaseType, {}, HTMLElement, any>;
    private yAxisAreaRight: Selection<BaseType, {}, HTMLElement, any>;
    // 軸
    public xAxis: XAxisDef;
    private yAxisDefs: YAxisDef[] = [];

    // 凡例
    private Legend: Legend;
    protected colors: d3.ScaleOrdinal<string, string>;

    // 各種Id
    public id: string;
    constructor(container: Selection<BaseType, {}, HTMLElement, any>, chartMargin: Layout.Margin) {
        // Id
        this.id = "line-chart-" + util.id();
        this.colors = d3.scaleOrdinal(d3.schemeCategory20);  // 20色を指定

        this.margin = new Layout.Margin(chartMargin);
        const svgSize = Layout.getSize(container);
        // Setting up Size
        this.size = Layout.getContentsSize(svgSize, chartMargin);
        //　チャートの全体
        this.canvas = container
            .append("g")
            .attr("class", "chart")
            .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

        // 線を引くエリア
        const clip_id = this.id + "-clip";
        this.plotArea = this.canvas.append("g")
            .attr("clip-path", "url(#" + clip_id + ")")
            .attr("class", "plotArea");

        this.plotArea.append("clipPath")  // プロットエリアからはみ出さないようにする
            .attr("id", clip_id)
            .append("rect")
            .attr("width", this.size.width)
            .attr("height", this.size.height);

        // Add the X Axis Area and Axis
        this.xAxisArea = this.canvas.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.size.height + ")");

        this.xAxis = new XAxisDef(this.xAxisArea, "default");
        this.xAxis.size.width = this.size.width;

        // Add the Y Axis Area (left & right)
        this.yAxisAreaLeft = this.canvas.append("g")
            .attr("class", "axis axis--y--l");

        this.yAxisAreaRight = this.canvas.append("g")
            .attr("class", "axis axis--y--r")
            .attr("transform", "translate( " + this.size.width + ", 0 )")   //

        // legend
        this.Legend = new Legend(this.canvas);
    }


    public getLine(lineData: LineSeriesData<Tx>, idx: number): string {
        const yaxis = this.yAxisDefs.filter((ax) => ax.name === lineData.yAxis)[0];
        const xaxis = this.xAxis;
        if (yaxis && xaxis) {
            // Define the line
            // https://bl.ocks.org/mbostock/0533f44f2cfabecc5e3a    //missing data
            const generator = d3.line<PlotData<number | Date>>()
                .defined((d, i, arr) => { return d.y ? true : false; })
                .x((d, i) => { return xaxis.scale(d.x) })
                .y((d, i) => { return yaxis.scale(d.y) });

            return generator(lineData.data) || "";
        }
        return "";
    }

    protected LoadXAxis(data: LineSeriesData<Tx>[]) {
        for (const line of data) {
            this.xAxis.loadData(line.xArray);
        }
    }

    protected LoadYAxis(data: LineSeriesData<Tx>[]) {
        const axis_keys = data.map((d) => d.yAxis).filter((k, i, arr) => arr.indexOf(k) === i); //y軸名一覧(distinct)
        for (const yaxis of this.yAxisDefs) {   // 使われてないｙ軸を削除
            if (axis_keys.indexOf(yaxis.name) >= 0) continue;
            // 削除
            yaxis.remove();
        }
        for (const axis_key of axis_keys) { // y軸再定義
            let yaxis = this.yAxisDefs.filter((ax) => ax.name === axis_key)[0];
            if (!yaxis) {   //初回
                const axis_idx = axis_keys.indexOf(axis_key)
                if (axis_idx == 0) {
                    yaxis = new YAxisDef(this.yAxisAreaLeft, axis_key)
                } else {
                    yaxis = new YAxisDef(this.yAxisAreaRight, axis_key)
                    yaxis.position = AxisPosition.Right;
                    yaxis.positionOffset = (axis_idx - 1) * 20;
                }
                yaxis.size.width = 20;
                yaxis.size.height = this.size.height;
                yaxis.color = this.colors(axis_idx.toString())
                this.yAxisDefs.push(yaxis);
            }
            //domain 評価
            const ydatas = data.filter((d) => d.yAxis === axis_key);
            for (const ydata of ydatas) {
                yaxis.loadData(ydata.yArray);
            }
        }
    }
    public clearData() {
        this.plotArea.selectAll("path").remove();
    }
    public loadData(data: LineSeriesData<Tx>[]) {

        // color
        let i = 0;
        for (const series of data) {
            if (!series.color) {    // assign color
                series.color = this.colors(i.toString());
            }
            if (series.id === "") { // assign id
                series.id = this.id + "-path-" + i + "-" + series.name.replace(/\s+/g, '');
            }
            i++;
        }

        this.LoadXAxis(data);
        this.LoadYAxis(data);
        this.Legend.LoadData(data);

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
        const selection = graph.enter()
            .append("path") //create any new path needed // データをバインドし、要素を追加(この時点で初めてDOMにタグが挿入)
            .attr("class", "series")   // バインドされたデータを使用して要素を操作
            .attr("id", (d, i) => d.id)
            .attr("stroke", (d, i) => d.color)
            .style("stroke-width", (d, i) => d.width) // 線の太さを決める
            //.attr("d", (d, i) => this.getLine(d, i))
            ;
        // redraw exist path
        this.draw();
        // and old data should be removed using exit().remove()
        // graph.transition().delay(500).duration(1000)

    }

    draw(animate: number = 500) {
        // 軸
        this.xAxis.draw(animate);
        for (const yaxis of this.yAxisDefs) {   // 描画
            yaxis.draw(animate);
        }

        // 凡例
        //this.Legend.draw(animate);

        //　線
        const graph = this.plotArea.selectAll<BaseType, LineSeriesData<Tx>>("path");
        graph
            .transition().duration(animate)
            .attr("d", (d, i) => this.getLine(d, i));
    }
}
