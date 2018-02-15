import * as d3 from "d3";
import { Selection } from "d3-selection";
import { BaseType } from "d3";
import * as d3ts from ".";


export class Legend extends d3ts.ChartDataPartsImpl<d3ts.SeriesData> {
    // // http://bl.ocks.org/JessicaFreaner/8fb0ac6c12aa1dab5f70
    // legend data
    constructor() {
        super("g");
    }
    private labels: d3ts.Text[] = [];

    public onClick: ((clickedtext: d3ts.Text) => void) | undefined;
    public onMouseover: ((clickedtext: d3ts.Text) => void) | undefined;
    public onMouseout: ((clickedtext: d3ts.Text) => void) | undefined;
    private ensureLabel() {
        this.ensureParts(this.labels, () => new d3ts.Text(), (p, d, i) => {
            p.loadData([d.name])
            p.attr.class = "legend";
            p.attr.y = i * 12;
            p.attr.stroke = d.pathAttr.stroke;
            p.for = d.id;
            p.event.onclick = (d, i, g) => {
                this.textEvent(g[i], this.onClick);
            };
            p.event.onmouseover = (d, i, g) => {
                this.textEvent(g[i], this.onMouseover);
            };
            p.event.onmouseout = (d, i, g) => {
                this.textEvent(g[i], this.onMouseout);
            };
        });
    }
    private textEvent(ele: any, handler: ((clickedtext: d3ts.Text) => void) | undefined) {
        if (!this.visible) return;
        if (!ele) return;
        const id: string = ele.id + '';
        if (handler) {
            const label = this.labels.find((l) => l.id === id);
            if (label) handler(label);
        }
    }
    loadData(data: d3ts.SeriesData[]) {
        super.loadData(data);
        this.ensureLabel();
    }

    drawSelf(canvas: d3ts.ChartCanvas, animate: number) {
    }
}