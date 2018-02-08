import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime, TransitionLike } from "d3";
import { Selection } from "d3-selection";
import { ChartDataParts, ChartPartsImpl, XAxisArea, Layout, LineSeriesData, PlotData, LineChart } from "."

class RangeSelecter extends ChartPartsImpl {
    constructor(onRangeChanged: () => void) {
        super("g");
        this.onRangeChanged = onRangeChanged;
        this.brush = d3.brushX();

    }
    protected onRangeChanged: () => void;

    private brush: d3.BrushBehavior<{}>;
    protected drawSelf(animate: number): void {
        if (!this.shape) throw "No shape";
        this.brush = this.brush
            .extent([[0, 0], [this.size.width, this.size.height]])
            .on("brush end", this.onRangeChanged);
        this.shape
            .attr("class", "brush")
            .call(<any>this.brush);
    }
    move(domain: any) {
        this.brush.move(<any>this.shape, domain);
        // RangeSelecterUI.call(<any>brush.move, main.xAxisArea.scale.getD3Scale().range().map(t.invertX, t));
    }
    // var brush = d3.brushX()
    //     .extent([[0, 0], [this.sub.size.width, this.sub.size.height]])
    //     .on("brush end", brushed);

    // const RangeSelecterUI = this.sub.canvas.append("g")
    //     .attr("class", "brush")
    //     .call(<any>brush)
    //     //.call(<any>brush.move, main.xScale.range());  //全範囲選択
    //     ;

}

class ZoomLayer extends ChartPartsImpl {
    constructor(onZoomed: () => void) {
        super("rect");
        this.onZoomed = onZoomed;
        this.zoom = d3.zoom()
            .scaleExtent([1, Infinity])

    }
    protected onZoomed: () => void;
    private zoom: d3.ZoomBehavior<Element, {}>;
    protected drawSelf(animate: number): void {
        if (!this.shape) throw "No shape";
        this.zoom.translateExtent([[0, 0], [this.size.width, this.size.height]])
            .extent([[0, 0], [this.size.width, this.size.height]])
            .on("zoom", this.onZoomed);
        this.shape
            .attr("class", "zoom")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .call(<any>this.zoom);
    }

    transform(range: number[]) {
        if (!this.shape) throw "No shape";
        const trans = d3.zoomIdentity
            .scale(this.size.width / (range[1] - range[0]))
            .translate(-range[0], 0)
        this.zoom.transform(<any>this.shape, trans)
    }
}
export class ZoomableLineChart<Tx extends number | Date> extends ChartDataParts<LineSeriesData<Tx>[]>{
    protected main: LineChart<Tx>;
    protected sub: LineChart<Tx>;
    private xrange: RangeSelecter;
    private zoom: ZoomLayer;
    constructor(size: Layout.Size, chartMargin: Layout.Margin) {
        super("g");
        const mainMargin = new Layout.Margin({ top: chartMargin.top, right: chartMargin.right, left: chartMargin.left, bottom: chartMargin.bottom + 100 });
        const subMargin = new Layout.Margin({ top: size.height - 100, right: chartMargin.right, left: chartMargin.left, bottom: chartMargin.bottom });
        const main = new LineChart<Tx>(size.subMargin(mainMargin), mainMargin);
        this.main = main;
        this.addParts(main);

        const sub = new LineChart<Tx>(size.subMargin(subMargin), subMargin);
        this.sub = sub;
        this.addParts(sub);
        //return;
        /// サブチャートに範囲選択UIを追加
        this.xrange = new RangeSelecter(() => this.brushed());
        this.xrange.size = this.sub.size;
        this.xrange.margin = this.sub.margin;
        this.addParts(this.xrange);

        this.zoom = new ZoomLayer(() => this.zoomed());
        this.zoom.size = this.main.size;
        this.zoom.margin = this.zoom.margin;
        this.addParts(this.zoom);

        // var zoom = d3.zoom()
        //     .scaleExtent([1, Infinity])
        //     .translateExtent([[0, 0], [main.size.width, main.size.height]])
        //     .extent([[0, 0], [main.size.width, main.size.height]])
        //     .on("zoom", zoomed);

        // const ZoomUI = main.canvas.append("rect")
        //     .attr("class", "zoom")
        //     .attr("width", main.size.width)
        //     .attr("height", main.size.height)
        //     .call(<any>zoom);
        // ;
    }
    brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var selected_range = this.main.xAxisArea.Zoom(d3.event.selection);
        this.zoom.transform(selected_range);    //selected_range
    }
    zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        console.log("zoomed");
        var t = d3.event.transform;
        var newData = t.rescaleX(this.sub.xAxisArea.scale.getD3Scale()).domain();
        this.main.xAxisArea.loadData(newData, true);
        this.main.draw(10);
        const scale = this.main.xAxisArea.scale.getD3Scale();
        if (scale) {
            const newdomain = scale.range().map(t.invertX, t)
            this.xrange.move(newdomain);
        }
    }

    public loadData(data: LineSeriesData<Tx>[]) {
        this.main.loadData(data);
        this.sub.loadData(data);
    }

    drawSelf(animate: number = 500) {
        if (!this.shape) throw "No shape";
        const anime = this.shape.transition().duration(animate);
    }
}
