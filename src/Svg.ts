import { Layout, ChartSelection } from ".";
import d3 = require("d3");

export class Svg {
    constructor(container_selector: string, size: Layout.ISize) {
        this._svg = d3.select(container_selector)
            .append("svg")
            .attr("width", size.width)
            .attr("height", size.height);
    }
    public _svg: ChartSelection;
}