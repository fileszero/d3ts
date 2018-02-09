import { ChartDataPartsImpl, Fill, ChartCanvas, PartsEvent } from ".";
import { util } from "./util";
import d3 = require("d3");

export interface TextAttr extends Fill {
    //https://developer.mozilla.org/ja/docs/Web/SVG/Element/text
    x: number | undefined;
    y: number | undefined;
    dx: number | undefined;
    dy: number | undefined;
    text_anchor: string | undefined;
    textLength: number | undefined;
    lengthAdjust: string | undefined;
    stroke: string | undefined;
}
export class Text extends ChartDataPartsImpl<string> {
    constructor() {
        super("text");
    }
    public attr: TextAttr = <TextAttr>{};
    public event: PartsEvent = <PartsEvent>{};
    drawSelf(canvas: ChartCanvas, animate: number): void {
        util.applySvgEvent(canvas, this.event);

        let txt = "";
        if (this.data) {
            txt = this.data.join("\n");
        }
        const anime = canvas.transition().duration(animate);
        util.applySvgAttr(anime, this.attr);
        anime.text(txt);
    }
}
