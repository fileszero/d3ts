import { ChartPartsImpl, ChartParts, ChartCanvas, ChartDataParts, Fill, SvgAttr } from ".";
import d3 = require("d3");
import { BaseType } from "d3";
import { util } from "./util";

export class Path<T> extends ChartPartsImpl implements ChartDataParts<T[]> {
    constructor(x?: (d: T, i: number, arr: T[]) => number, y?: (d: T, i: number, arr: T[]) => number) {
        super();
        this.xf = x;
        this.yf = y;
    }
    loadData(data: T[], reset?: boolean): void {
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
    public attr: SvgAttr = {};
    private data: T[] | undefined;
    private xf: ((d: T, i: number, arr: T[]) => number) | undefined;
    private yf: ((d: T, i: number, arr: T[]) => number) | undefined;

    drawSelf(canvas: ChartCanvas, animate: number): void {
        if (!this.shape) {
            this.shape = canvas.append("path");
        }
        // https://qiita.com/daxanya1/items/734e65a7ca58bbe2a98c#6%E7%B7%9A%E3%82%92%E5%BC%95%E3%81%93%E3%81%86path%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9
        if (!this.xf || !this.yf) throw "No x,y function";
        const line = d3.line<T>().x(this.xf).y(this.yf);
        const anime = this.shape.transition().duration(animate);
        util.applySvgAttr(anime, this.attr);

        const typedCanvas = anime.selectAll<BaseType, T[]>("path")
        typedCanvas.attr("d", (d, i) => line(d));
    }
}
