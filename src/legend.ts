import * as d3 from "d3";
import { Selection } from "d3-selection";
import { BaseType } from "d3";
import { SeriesData } from ".";


export class Legend {
    // http://bl.ocks.org/JessicaFreaner/8fb0ac6c12aa1dab5f70
    // 表示エリア
    public parentArea: Selection<BaseType, {}, HTMLElement, any>;
    public drawArea: Selection<BaseType, {}, HTMLElement, any>;

    // legend data
    protected Series: SeriesData[] = [];
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>) {
        this.parentArea = parentArea;
        this.drawArea = this.parentArea.append("g");
    }

    LoadData(src: SeriesData[]) {
        this.Series = src;
    }

    draw(animate: number) {
        let idx = 0;
        for (let legend of this.Series) {
            this.drawArea.append("text")
                .attr("y", idx * 12)
                .attr("class", "legend")  // style the legend
                .style("fill", legend.color)
                .text(legend.name);
            idx++;
        }
    }
}