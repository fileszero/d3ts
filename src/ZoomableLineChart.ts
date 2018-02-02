import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";
import { Selection } from "d3-selection";
import { Layout } from "./layout"
import { YAxisDef } from "./AxisDef"
import { LineSeriesData, PlotData } from "./data";
import { LineChart } from "./LineChart";

export class ZoomableLineChart<Tx extends number | Date> {
    protected main: LineChart<Tx>;
    protected sub: LineChart<Tx>;
    constructor(container: Selection<BaseType, {}, HTMLElement, any>, chartMargin: Layout.Margin) {
        const svgSize = Layout.getSize(container);
        const mainMargin = new Layout.Margin({ top: chartMargin.top, right: chartMargin.right, left: chartMargin.left, bottom: chartMargin.bottom + 100 });
        const subMargin = new Layout.Margin({ top: svgSize.height - 100, right: chartMargin.right, left: chartMargin.left, bottom: chartMargin.bottom });
        const main = new LineChart<Tx>(container, mainMargin);
        const sub = new LineChart<Tx>(container, subMargin);

        this.main = main;
        this.sub = sub;
        if (!main.canvas) throw "no main chart"
        if (!sub.canvas) throw "no sub chart"
        //return;
        /// サブチャートに範囲選択UIを追加
        var brush = d3.brushX()
            .extent([[0, 0], [sub.size.width, sub.size.height]])
            .on("brush end", brushed);

        const RangeSelecterUI = sub.canvas.append("g")
            .attr("class", "brush")
            .call(<any>brush)
            //.call(<any>brush.move, main.xScale.range());  //全範囲選択
            ;


        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [main.size.width, main.size.height]])
            .extent([[0, 0], [main.size.width, main.size.height]])
            .on("zoom", zoomed);

        const ZoomUI = main.canvas.append("rect")
            .attr("class", "zoom")
            .attr("width", main.size.width)
            .attr("height", main.size.height)
            .call(<any>zoom);
        ;
        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var selected_range = main.xAxis.Zoom(d3.event.selection);
            ZoomUI.call(<any>zoom.transform,
                d3.zoomIdentity
                    .scale(main.size.width / (selected_range[1] - selected_range[0]))
                    .translate(-selected_range[0], 0)
            );
        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            // console.log("zoomed");
            var t = d3.event.transform;
            main.xAxis.loadData(t.rescaleX(sub.xAxis.getScale()).domain(), true);
            main.draw(100);
            RangeSelecterUI.call(<any>brush.move, main.xAxis.range().map(t.invertX, t));
        }

    }

    public LoadData(data: LineSeriesData<Tx>[]) {
        this.main.loadData(data);
        this.sub.loadData(data);
    }
}
