import * as d3 from "d3";
import { Selection } from "d3-selection";
import { BaseType } from "d3";
import * as d3ts from ".";


export class Legend extends d3ts.ChartDataPartsImpl<d3ts.SeriesData> {
    // legend data
    constructor() {
        super("g");
    }
    private labels: d3ts.Text[] = [];


    private ensureLabel() {
        this.ensureParts(this.labels, () => new d3ts.Text(), (p, d, i) => {
            p.loadData([d.name])
            p.attr.class = "legend";
            p.attr.y = i * 12;
            p.attr.stroke = d.color;
        });
    }
    loadData(data: d3ts.SeriesData[]) {
        super.loadData(data);
        this.ensureLabel();
    }

    drawSelf(canvas: d3ts.ChartCanvas, animate: number) {
    }
}