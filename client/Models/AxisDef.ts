import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime } from "d3";

export enum AxisPosition { left, right }
export class YAxisDef {
    constructor(name: string, index: number) {
        this.name = name;
        this.className = "yaxis--" + name
        this.index = index;
    }
    set height(val: number) {
        this.scale = d3.scaleLinear().range([val, 0]);    // Yの描画範囲
        this.scale.domain([this.min, this.max]);
    }
    public name: string;
    public index: number;
    public scale: ScaleLinear<number, number>;
    public className: string;
    public axis: d3.Axis<number | Date | { valueOf(): number; }>;
    public color: string;

    protected max: number = 0;
    protected min: number = 0;
    domain(yvalues: number[]) {
        const max = d3.max(yvalues) || 0;
        if (max > this.max) this.max = max;
        const min = d3.min(yvalues) || 0;
        if (min < this.min) this.min = min;
        if (this.scale) {
            this.scale.domain([this.min, this.max]);
        }
    }
}
