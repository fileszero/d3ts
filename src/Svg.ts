import { Layout, ChartCanvas, ChartPartsImpl } from ".";
import d3 = require("d3");

export class Svg extends ChartPartsImpl {
    constructor(container_selector: string, size?: Layout.ISize) {
        super("svg", container_selector);
        if (size) {
            this.size.set(size);
        }
    }
    drawSelf(animate: number): void {
        if (this.shape) {
            this.shape.attr("width", this.size.width)
                .attr("height", this.size.height);
        }
    }

}