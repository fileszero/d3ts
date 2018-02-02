import { Layout, ChartCanvas, ChartPartsImpl } from ".";
import d3 = require("d3");

export class Svg extends ChartPartsImpl {
    constructor(container_selector: string, size?: Layout.ISize) {
        super();
        this.canvas = d3.select(container_selector).append("svg");
        if (size) {
            this.size.set(size);
        }
    }

    drawSelf(canvas: ChartCanvas, animate: number): void {
        this.canvas = canvas.attr("width", this.size.width)
            .attr("height", this.size.height);
    }

}