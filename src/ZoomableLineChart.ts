import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime, TransitionLike } from "d3";
import { Selection } from "d3-selection";
import { ChartDataPartsImpl, ChartPartsImpl, XAxisArea, Layout, LineSeriesData, PlotData, LineChart, ChartCanvas, LineChartOption, AxisArea, Crosshair } from "."

class RangeSelecter extends ChartPartsImpl {
    constructor(zoomAxis: AxisArea, onRangeChanged: (newRange: number[]) => void) {
        super("g");
        this.zoomAxis = zoomAxis;

        this.onRangeChanged = onRangeChanged;
        this.brush = d3.brushX();

    }
    protected onRangeChanged: (newRange: number[]) => void;

    private brush: d3.BrushBehavior<{}>;
    private zoomAxis: AxisArea;

    protected drawSelf(canvas: ChartCanvas, animate: number): void {
        this.brush = this.brush
            .extent([[0, 0], [this.size.width, this.size.height]])
            .on("brush end", () => { this.brushed(); });
        canvas
            .attr("class", "brush")
            .call(<any>this.brush);
    }
    private brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        console.log("brushed");
        var selected_range = this.zoomAxis.Zoom(d3.event.selection);
        this.onRangeChanged(selected_range);
        // this.zoom.transform(selected_range);    //selected_range
    }

    move(domain: any) {
        this.brush.move(<any>this.shape, domain);
        // RangeSelecterUI.call(<any>brush.move, main.xAxisArea.scale.getD3Scale().range().map(t.invertX, t));
    }
}

class ZoomLayer extends ChartPartsImpl {
    constructor(fixAxis: AxisArea, zoomAxis: AxisArea, onZoomed: (newdomain: {}[]) => void) {
        //super("rect");
        super(".");
        this.fixAxis = fixAxis;
        this.zoomAxis = zoomAxis;
        this.onZoomed = onZoomed;
        this.zoom = d3.zoom()
            .scaleExtent([1, Infinity])

    }
    protected onZoomed: (newdomain: {}[]) => void;
    private zoom: d3.ZoomBehavior<Element, {}>;
    private fixAxis: AxisArea;
    private zoomAxis: AxisArea
    protected drawSelf(canvas: ChartCanvas, animate: number): void {
        this.zoom = this.zoom.translateExtent([[0, 0], [this.size.width, this.size.height]])
            .extent([[0, 0], [this.size.width, this.size.height]])
            .on("zoom." + this.id, () => { this.zoomed(); });
        canvas
            .attr("class", "zoom")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .call(<any>this.zoom);
    }
    private zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        console.log("zoomed");
        var t = d3.event.transform;
        var newData = t.rescaleX(this.fixAxis.scale.getD3Scale()).domain();
        this.zoomAxis.clearData();
        this.zoomAxis.loadData(newData);
        // this.main.draw(10);
        const newScale = this.zoomAxis.scale.getD3Scale();
        let newdomain: {}[] = [];
        if (newScale) {
            newdomain = newScale.range().map(t.invertX, t)
        }
        this.onZoomed(newdomain);
        // this.xrange.move(newdomain);
    }

    transform(range: number[]) {
        if (!this.shape) throw "No shape";
        const trans = d3.zoomIdentity
            .scale(this.size.width / (range[1] - range[0]))
            .translate(-range[0], 0)
        this.zoom.transform(<any>this.shape, trans)
    }
}
export class ZoomableLineChart<Tx extends number | Date> extends ChartDataPartsImpl<LineSeriesData<Tx>>{
    protected main: LineChart<Tx>;
    protected sub: LineChart<Tx>;
    private xrange: RangeSelecter;
    private zoom: ZoomLayer;
    private crosshair: Crosshair;

    public set option(opt: LineChartOption) {
        this.main.option = opt;
    }
    public get option(): LineChartOption {
        return this.main.option;
    }

    constructor(size: Layout.Size, chartMargin: Layout.Margin) {
        super("g");
        const mainMargin = new Layout.Margin({ top: chartMargin.top, right: chartMargin.right, left: chartMargin.left, bottom: chartMargin.bottom + 100 });
        const subMargin = new Layout.Margin({ top: size.height - 100, right: chartMargin.right, left: chartMargin.left, bottom: chartMargin.bottom });
        const main = new LineChart<Tx>(size.subMargin(mainMargin), mainMargin);
        this.main = main;
        this.main.option.showGrid = true;
        this.append(main);

        this.crosshair = new Crosshair();
        this.crosshair.size = this.main.size;
        this.main.plotArea.append(this.crosshair);

        const sub = new LineChart<Tx>(size.subMargin(subMargin), subMargin);
        this.sub = sub;
        this.append(sub);
        //return;
        /// サブチャートに範囲選択UIを追加
        this.xrange = new RangeSelecter(this.main.xAxisArea, (newRange: number[]) => { this.zoom.transform(newRange); });
        this.xrange.size = this.sub.size;
        this.sub.plotArea.append(this.xrange);

        this.zoom = new ZoomLayer(this.sub.xAxisArea, this.main.xAxisArea, (newdomain: {}[]) => {
            this.main.draw(10);
            if (newdomain.length > 0) this.xrange.move(newdomain);
        });
        this.zoom.size = this.main.size;
        this.main.plotArea.append(this.zoom);
    }

    public loadData(data: LineSeriesData<Tx>[]) {
        this.main.loadData(data);
        this.sub.loadData(data);
    }

    drawSelf(canvas: ChartCanvas, animate: number = 500) {
        const anime = canvas.transition().duration(animate);
    }
}
