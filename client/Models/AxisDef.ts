import * as d3 from "d3";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime, min } from "d3";

class AxisDef<Tx extends number | Date> {
    constructor(defaultValue: Tx) {
        this.defaultValue = defaultValue;
        this.max = defaultValue;
        this.min = defaultValue;
    }

    public name: string;
    public index: number;

    public scale: ScaleLinear<number, number>;

    // 表示要素
    public className: string;
    public axis: d3.Axis<Tx | { valueOf(): number; }>;
    public color: string;

    protected defaultValue: Tx;
    protected max: Tx;
    protected min: Tx;
    domain(values: Tx[]) {
        const max = d3.max(values) || this.defaultValue;
        if (max > this.max) this.max = max;
        const min = d3.min(values) || this.defaultValue;
        if (min < this.min) this.min = min;
        if (this.scale) {
            this.scale.domain([this.min, this.max]);
        }
    }

    set height(val: number) {
        this.scale = d3.scaleLinear().range([val, 0]);    // Yの描画範囲
        this.scale.domain([this.min, this.max]);
    }

}
export class YAxisDef extends AxisDef<number>{
    constructor(name: string, index: number) {
        super(0);
        this.name = name;
        this.className = "yaxis--" + name
        this.index = index;
    }
}

export class XAxisDef<Tx extends number | Date> extends AxisDef<Tx>{
    constructor(name: string, defaultValue: Tx, index: number) {
        super(defaultValue);
        this.name = name;
        this.className = "xaxis--" + name
        this.index = index;
    }
}