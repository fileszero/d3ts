import { ChartPartsImpl, ChartParts, ChartCanvas, ChartDataParts, Fill } from ".";
import { util } from "./util";

export interface CircleAttr extends Fill {
    // https://developer.mozilla.org/ja/docs/Web/SVG/Element/circle
    cx: number,
    cy: number,
    r: number
}
export class Circle extends ChartDataParts<CircleAttr> {
    constructor() {
        super("circle");
        this.data = <CircleAttr>{ cx: 0, cy: 0, r: 0 };
    }
    drawSelf(animate: number): void {
        if (this.shape && this.data) {
            const anime = this.shape.transition().duration(animate);
            util.applySvgAttr(anime, this.data);
        }
    }
}
