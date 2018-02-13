import * as d3 from "d3";
import { Selection } from "d3-selection";
import { BaseType } from "d3";
import * as d3ts from ".";

export class Crosshair extends d3ts.ChartDataPartsImpl<d3ts.SeriesData> {
    // https://bl.ocks.org/micahstubbs/e4f5c830c264d26621b80b754219ae1b
    // https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
    constructor() {
        super(".");
    }
    private vLine: d3ts.Path<number> | undefined;
    private mouseCap: d3ts.ChartCanvas | undefined;  // a rect to catch mouse movements on canvas
    protected drawSelf(canvas: d3ts.ChartCanvas, animate: number): void {
        if (!this.vLine) {
            this.vLine = new d3ts.Path(
                (d, i, arr) => {
                    // console.log("x=" + arr[0]);
                    return arr[0];
                },
                (d, i, arr) => {
                    let y = 0;
                    if (i === 0) y = this.size.height;
                    // console.log("y=" + y);
                    return y;
                }
            );
            this.append(this.vLine);
            this.vLine.attr.stroke = "black";
            this.vLine.attr.fillOpacity = 1;
            //this.vLine.loadData([100, 100]);
        }
        if (!this.mouseCap) {
            const self = this;
            this.mouseCap = canvas.append("rect");   // append a rect to catch mouse movements on canvas
            this.mouseCap
                .attr('width', this.size.width) // can't catch mouse events on a g element
                .attr('height', this.size.height)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .on('mousemove.' + this.id, (d, i, g) => {
                    self.mousemove(g[0]);
                });
        }
    }
    private mousemove(rect: any) {
        var mouse = d3.mouse(rect);
        if (this.vLine) {
            this.vLine.loadData(mouse);
            this.vLine.draw(0);
        }
    }
}