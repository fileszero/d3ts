import { Layout, ChartCanvas, ChartPartsImpl } from ".";
import d3 = require("d3");

export class Svg extends ChartPartsImpl {
    constructor(container_selector: string, size?: Layout.ISize) {
        super();
        this.selector = container_selector;
        if (size) {
            this.size.set(size);
        }
    }
    public selector: string;

    draw(animate: number) {
        if (!this.canvas) {
            this.canvas = d3.select(this.selector).append("svg");
        }
        super.draw(animate);
    }
    drawSelf(canvas: ChartCanvas, animate: number): void {
        this.canvas = canvas.attr("width", this.size.width)
            .attr("height", this.size.height);
    }

}