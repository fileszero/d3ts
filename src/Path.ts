import { ChartPartsImpl, ChartParts, ChartCanvas, ChartDataPartsImpl, Fill, SvgAttr, Scale, ScaleParts, ChartTransition } from ".";
import d3 = require("d3");
import { BaseType, Line } from "d3";
import { util } from "./util";

export interface PathAttr extends Fill {
    stroke: string | undefined;
    stroke_width: number | undefined;
}
export type PathValue = number | Date;
export class Path<Tx> extends ChartDataPartsImpl<Tx> {
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

    private xFunc(d: Tx, i: number, arr: Tx[]): number | undefined {
        if (!this.xf) return undefined;
        let val = this.xf(d, i, arr);
        if (val === undefined) return undefined;
        if (val === NaN) return undefined;
        if (this.scale && this.scale.xscale) {
            val = this.scale.xscale.scale(val);
        }
        if (util.isNumber(val)) return val;
        return 0;
    }
    private yFunc(d: Tx, i: number, arr: Tx[]): number | undefined {
        if (!this.yf) return undefined;
        let val = this.yf(d, i, arr);
        if (val === undefined) return undefined;
        if (val === NaN) return undefined;
        if (this.scale && this.scale.yscale) {
            val = this.scale.yscale.scale(val);
        }
        if (util.isNumber(val)) return val;
        return 0;
    }

    public show: boolean = true;
    drawSelf(canvas: ChartCanvas, animate: number): void {
        // https://qiita.com/daxanya1/items/734e65a7ca58bbe2a98c#6%E7%B7%9A%E3%82%92%E5%BC%95%E3%81%93%E3%81%86path%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9
        if (!this.xf) return;
        if (!this.yf) return;
        if (!this.data) return;

        const xf = (d: Tx, i: number, a: Tx[]): number => { return this.xFunc(d, i, a) || 0; };  //this.xf ? this.xf : this.defaultXYFunction;
        const yf = (d: Tx, i: number, a: Tx[]): number => { return this.yFunc(d, i, a) || 0; };   //this.yf ? this.yf : this.defaultXYFunction;;
        const generator = d3.line<Tx>()
            .defined((d, i, ar) => {
                const val = this.yFunc(d, i, ar);    //yf(d, i, ar);
                let result = true;
                if (val === undefined) result = false;
                else if (isNaN(val)) result = false;
                // console.log(val + "=>" + result);
                return result;
            })
            .x(xf)
            .y(yf)
            ;
        //this.shape.attr("d", generator(this.data) || "");

        let anime: ChartCanvas | ChartTransition;
        if (animate > 0) {
            anime = canvas.transition().duration(animate);
        } else {
            anime = canvas;
        }
        util.applySvgStyle(anime, this.attr);
        anime.attr("for", this.for || "");
        anime.attr("d", generator(this.data) || "");
    }

}
