import { ScaleTime, ScaleLinear } from "d3";
import { util } from "./util";
import d3 = require("d3");
import { ChartParts } from ".";

export type AxisScale = ScaleTime<number, number> | ScaleLinear<number, number>;
export class Scale {
    constructor() {
    }
    protected mScale: ScaleTime<number, number> | ScaleLinear<number, number> | undefined;
    protected max?: number | Date;
    protected min?: number | Date;

    range: number[] = [];

    getD3Scale(): AxisScale | undefined {
        this.updateScale();
        return this.mScale;
    }
    scale(val: number | Date | undefined): number {
        this.updateScale();
        if (util.isNumber(val)) {
            return (<ScaleLinear<number, number>>this.mScale)(val);
        }
        if (util.isDate(val)) {
            return (<ScaleTime<number, number>>this.mScale)(val);
        }
        return 0;
    }
    loadData(values: (number | Date | undefined)[], reset: boolean = false) {
        if (reset) {
            this.clearData();
        }
        const availavle_vals: (number | Date)[] = <(number | Date)[]>values.filter((v) => v != undefined);
        const max = d3.max(availavle_vals);
        if (max) {
            if (!this.max || max > this.max) this.max = max;
        }
        const min = d3.min(availavle_vals);
        if (min) {
            if (!this.min || min < this.min) this.min = min;
        }
    }
    clearData() {
        this.max = undefined;
        this.min = undefined;
    }

    private updateScale(): void {
        if (this.max && this.min) {
            if (util.isDate(this.max)) {
                this.mScale = d3.scaleTime().range(this.range);    // Yの描画範囲
                this.mScale = this.mScale.domain([this.min, this.max]);
            }
            if (util.isNumber(this.max)) {
                this.mScale = d3.scaleLinear().range(this.range);    // Yの描画範囲
                this.mScale = this.mScale.domain([this.min, this.max]);
            }
        }
    }

}