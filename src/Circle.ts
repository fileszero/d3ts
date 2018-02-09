import { ChartPartsImpl, ChartParts, ChartCanvas, ChartDataPartsImpl, Fill } from ".";
import { util } from "./util";

export interface CircleAttr extends Fill {
    // https://developer.mozilla.org/ja/docs/Web/SVG/Element/circle
    cx: number,
    cy: number,
    r: number
}
export class Circle extends ChartDataPartsImpl<CircleAttr> {
    constructor() {
        super("circle");
        this.data = [<CircleAttr>{ cx: 0, cy: 0, r: 0 }];
    }
    drawSelf(canvas: ChartCanvas, animate: number): void {
        if (this.data) {
            const anime = canvas.transition().duration(animate);
            util.applySvgAttr(anime, this.data[0]);
        }
    }
}
