import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { Legend, Layout, LineSeriesData, PlotData, ChartDataPartsImpl, ChartPartsImpl, ChartCanvas, Path, Scale, ScaleParts, XAxisArea, XYAxis, YAxisArea } from ".";
import { util } from "./util";
import * as d3ts from ".";

export interface LineChartOption {
    LegendPos: Layout.Position;
}
export class PlotArea<Tx extends number | Date> extends ChartDataPartsImpl<LineSeriesData<Tx>>  {
    constructor() {
        super("g");  //g
    }

    // private paths: Path<PlotData<Tx>>[] = [];
    private _clip: ChartCanvas | undefined;
    drawSelf(canvas: ChartCanvas, animate: number): void {
        if (!this.data) throw "No data";
        // 線を引くエリア
        const clip_id = this.id + "-clip";
        canvas
            .attr("clip-path", "url(#" + clip_id + ")")
            .attr("class", "plotArea");
        if (!this._clip) {
            this._clip = canvas.append("clipPath")  // プロットエリアからはみ出さないようにする
                .attr("id", clip_id)
                .append("rect");
        }
        this._clip
            .attr("width", this.size.width)
            .attr("height", this.size.height);

        const anime = canvas.transition().duration(animate);
    }

}
export class LineChart<Tx extends number | Date> extends ChartDataPartsImpl<LineSeriesData<Tx>>{
    /** xの描画範囲 */
    // public xScale: ScaleTime<number, number>;
    /** */

    // 表示領域
    public plotArea: PlotArea<Tx>;
    public xAxisArea: XAxisArea;
    // private xAxisArea: Selection<BaseType, {}, HTMLElement, any>;
    // private yAxisAreaLeft: Selection<BaseType, {}, HTMLElement, any>;
    // private yAxisAreaRight: Selection<BaseType, {}, HTMLElement, any>;
    // // 軸
    // public xAxis: XAxisDef;
    private AxisDefs: XYAxis[] = [];

    // 系列
    private paths: Path<PlotData<Tx>>[] = [];
    private findPathFor(forid: string | undefined): Path<PlotData<Tx>> | undefined {
        if (forid) return this.paths.find((p) => p.for === forid);
        return undefined;
    }
    // 凡例
    private Legend: Legend;
    protected colors: d3.ScaleOrdinal<string, string>;

    /** 軸を作成 */
    private ensureAxis(): void {
        if (!this.data) return;
        for (const ts of this.data) {    //軸毎の処理
            let axis = this.AxisDefs.filter((ax) => ax.name === ts.name)[0];
            if (!axis) {    // new !
                const yaxis = new YAxisArea();
                yaxis.size.height = this.plotArea.size.height;
                this.append(yaxis);
                axis = new XYAxis(ts.name, this.xAxisArea, yaxis);
                if (this.AxisDefs.length == 0) {
                    yaxis.position = Layout.Position.Left;
                } else {
                    yaxis.position = Layout.Position.Right;
                    yaxis.margin.left = this.plotArea.size.width + ((this.AxisDefs.length - 1) * 40);
                }
                this.AxisDefs.push(axis);
                yaxis.attr.stroke = this.colors(this.AxisDefs.length.toString());
            }
            axis.xAxis.loadData(<(number | Date)[]>ts.xArray);
            axis.yAxis.loadData(<(number | Date)[]>ts.yArray);
        }
    }

    private ensurePath(): void {
        this.ensureParts(this.paths, () => new Path<PlotData<Tx>>((d) => d.x, (d) => d.y), (p, d, i) => {
            p.loadData(d.data);
            const axis = this.AxisDefs.filter((ax) => ax.name === d.name)[0];

            p.scale = axis;
            p.attr.stroke = d.color;
            p.for = d.id;
        }, this.plotArea);
    }
    loadData(data: LineSeriesData<Tx>[]) {
        super.loadData(data);
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            if (!d.color) {
                d.color = this.colors(i.toString());
            }
        }
        this.plotArea.loadData(data);
        this.ensureAxis();
        this.ensurePath();
        this.Legend.loadData(data);
    }

    drawSelf(canvas: ChartCanvas, animate: number = 500) {
        this.Legend.visible = (this.option.LegendPos !== undefined);
        canvas
            .attr("class", "chart");
        const anime = canvas.transition().duration(animate);
    }
    public option: LineChartOption = <LineChartOption>{};
    constructor(size: Layout.Size, chartMargin: Layout.Margin) {
        super("g");
        this.colors = d3.scaleOrdinal(d3.schemeCategory20);  // 20色を指定

        this.size = size;
        this.margin = new Layout.Margin(chartMargin);

        // 線を引くエリア
        this.plotArea = new PlotArea<Tx>();
        this.plotArea.size = this.size; //.subMargin(chartMargin);
        this.append(this.plotArea);

        // x軸
        this.xAxisArea = new XAxisArea();
        this.xAxisArea.size.width = this.plotArea.size.width;
        this.xAxisArea.margin.top = this.plotArea.size.height;
        this.append(this.xAxisArea);

        this.Legend = new Legend();
        this.Legend.onClick = (text: d3ts.Text) => {
            const path = this.findPathFor(text.for);
            if (path) {
                path.show = !path.show;
                if (text.shape) text.shape.style("opacity", path.show ? 1 : 0.3)
                path.draw();
            }
        }
        this.Legend.onMouseover = (text: d3ts.Text) => {
            const path = this.findPathFor(text.for);
            if (path) {
                path.attr.stroke_width = 5;
                path.draw();
            }
        }

        this.Legend.onMouseout = (text: d3ts.Text) => {
            const path = this.findPathFor(text.for);
            if (path) {
                path.attr.stroke_width = 1;
                path.draw();
            }
        }

        this.append(this.Legend);
    }


}
