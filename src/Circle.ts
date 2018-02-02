import { ChartPartsImpl, ChartParts, ChartCanvas, ChartDataParts, Fill } from ".";

export interface CircleAttr extends Fill {
    // https://developer.mozilla.org/ja/docs/Web/SVG/Element/circle
    cx: number,
    cy: number,
    r: number
}
export class Circle extends ChartPartsImpl implements ChartDataParts<CircleAttr> {
    constructor() {
        super();
        this.data = <CircleAttr>{ cx: 0, cy: 0, r: 0 };
    }
    loadData(data: CircleAttr, reset?: boolean): void {
        if (reset) {
            this.clearData();
        }
        this.data = data;
    }
    clearData(): void {
        if (this.shape) {
            this.shape.remove();
        }
    }

    private shape: ChartCanvas | undefined;
    private data: CircleAttr;

    drawSelf(canvas: ChartCanvas, animate: number): void {
        if (!this.shape) {
            this.shape = canvas.append("circle");
        }
        for (let attr in this.data) {
            const val = this.data[attr];
            if (val) {
                this.shape.attr(attr, val)
            }
        }
        this.shape.transition().duration(animate);
    }
}
