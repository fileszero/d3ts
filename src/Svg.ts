import { Layout, ChartCanvas, ChartPartsImpl } from ".";
import d3 = require("d3");

export class Svg extends ChartPartsImpl {
    constructor(container_selector: string, size: Layout.ISize) {
        super();
        this.canvas = d3.select(container_selector)
            .append("svg")
            .attr("width", size.width)
            .attr("height", size.height);
    }
    draw(animate: number): void {
        throw new Error("Method not implemented.");
    }

}