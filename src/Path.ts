import { ChartPartsImpl, ChartParts, ChartCanvas, ChartDataParts, Fill, SvgAttr, Scale, ScaleParts } from ".";
import d3 = require("d3");
import { BaseType, Line } from "d3";
import { util } from "./util";

export interface PathAttr extends Fill {
    stroke: string | undefined;
}
export type PathValue = number | Date;
export class Path<Tx> extends ChartDataParts<Tx[]> {
    constructor(x?: (d: Tx, i: number, arr: Tx[]) => (PathValue | undefined), y?: (d: Tx, i: number, arr: Tx[]) => (PathValue | undefined)) {
        super("path");
        this.xf = x;
        this.yf = y;
    }

    public attr: PathAttr = <PathAttr>{};
    private xf: ((d: Tx, i: number, arr: Tx[]) => (PathValue | undefined)) | undefined;
    private yf: ((d: Tx, i: number, arr: Tx[]) => (PathValue | undefined)) | undefined;

    scale: ScaleParts | undefined;

    private defaultXYFunction(d: Tx, i: number, arr: Tx[]): number {
        return 0;
    }

    private xFunc(d: Tx, i: number, arr: Tx[]): number {
        if (!this.xf) return 0;
        let val = this.xf(d, i, arr) || 0;
        if (this.scale && this.scale.xscale) {
            val = this.scale.xscale.scale(val);
        }
        if (util.isNumber(val)) return val;
        return 0;
    }
    private yFunc(d: Tx, i: number, arr: Tx[]): number {
        if (!this.yf) return 0;
        let val = this.yf(d, i, arr) || 0;
        if (this.scale && this.scale.yscale) {
            val = this.scale.yscale.scale(val);
        }
        if (util.isNumber(val)) return val;
        return 0;
    }

    drawSelf(animate: number): void {
        if (!this.shape) throw "No shape";
        // https://qiita.com/daxanya1/items/734e65a7ca58bbe2a98c#6%E7%B7%9A%E3%82%92%E5%BC%95%E3%81%93%E3%81%86path%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9
        if (!this.xf) throw "No x function";
        if (!this.yf) throw "No y function";
        if (!this.data) throw "No data";

        const xf = (d: Tx, i: number, a: Tx[]): number => { return this.xFunc(d, i, a); };  //this.xf ? this.xf : this.defaultXYFunction;
        const yf = (d: Tx, i: number, a: Tx[]): number => { return this.yFunc(d, i, a); };   //this.yf ? this.yf : this.defaultXYFunction;;
        const generator = d3.line<Tx>()
            .defined((d, i, ar) => { return yf(d, i, ar) ? true : false; })
            .x(xf)
            .y(yf)
            ;
        //this.shape.attr("d", generator(this.data) || "");

        const anime = this.shape.transition().duration(animate);
        util.applySvgAttr(anime, this.attr);

        anime.attr("d", generator(this.data) || "");
    }

}
