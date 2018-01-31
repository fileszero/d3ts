import * as d3 from "d3";
import { Selection } from "d3-selection";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime, min, AxisScale, Axis } from "d3";
import { Domain } from "domain";
import { Layout } from "./layout";

export enum AxisPosition {
    Top,
    Right,
    Bottom,
    Left
}
abstract class AxisDef<Tx extends number | Date> {
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>) {
        this.parentArea = parentArea;
    }

    public name: string;

    //
    abstract updateScale(): AxisScale<number | Date | { valueOf(): number; }>;

    // 表示属性
    public className: string;
    public axis: d3.Axis<Tx | { valueOf(): number; }>;
    public color: string;
    public position: AxisPosition;
    public positionOffset: number = 0;

    // 表示エリア
    public parentArea: Selection<BaseType, {}, HTMLElement, any>;
    public drawArea: Selection<BaseType, {}, HTMLElement, any>;

    protected max: Tx;
    protected min: Tx;
    domain(values: Tx[]) {
        const max = d3.max(values);
        if (max) {
            if (max > this.max || !this.max) this.max = max;
        }
        const min = d3.min(values);
        if (min) {
            if (min < this.min || !this.min) this.min = min;
        }
        this.updateScale();
    }

    protected mHeight: number = 0;
    get height() { return this.mHeight; }
    set height(val: number) {
        this.mHeight = val;
        this.updateScale();
    }

    protected mWidth: number = 0;
    get width() { return this.mWidth; }
    set width(val: number) {
        this.mWidth = val;
        this.updateScale();
    }


    show(): void {
        const axis_g = this.parentArea.append("g")
            .attr("class", this.className)
            .attr("stroke", this.color);
        //.attr("transform", "translate(0," + this.parentArea.size..size.height + ")");
        const scale = this.updateScale();
        let axisFunc = d3.axisLeft;   // default left
        let x_offset = 0, y_offset = 0;
        if (this.position === AxisPosition.Left) {
            axisFunc = d3.axisLeft;
            x_offset = this.positionOffset;
        } else if (this.position === AxisPosition.Right) {
            axisFunc = d3.axisRight;
            x_offset = this.positionOffset;
        } else if (this.position === AxisPosition.Top) {
            axisFunc = d3.axisTop;
            y_offset = this.positionOffset;
        } else if (this.position === AxisPosition.Bottom) {
            axisFunc = d3.axisBottom;
            y_offset = this.positionOffset;
        }

        this.axis = axisFunc(scale);
        if (x_offset != 0 || y_offset) {
            axis_g.attr("transform", "translate(" + x_offset + ", " + y_offset + " )");
        }

        this.parentArea.select("." + this.className)
            .transition().duration(500)
            .call(<any>this.axis);
    }

    remove(): void {
        this.parentArea.select("." + this.className).remove();
    }
}
export class YAxisDef extends AxisDef<number>{
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>, name: string) {
        super(parentArea);
        this.name = name;
        this.className = "yaxis--" + name
        this.position = AxisPosition.Left;
    }
    public scale: ScaleLinear<number, number>;

    updateScale() {
        this.scale = d3.scaleLinear().range([this.height, this.width]);    // Yの描画範囲
        if (this.scale) {
            this.scale.domain([this.min, this.max]);
        }
        return this.scale;
    }
}

export class XAxisDef<Tx extends number | Date> extends AxisDef<Tx>{
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>, name: string) {
        super(parentArea);
        this.name = name;
        this.className = "xaxis--" + name
        this.position = AxisPosition.Bottom;
    }
    public scale: ScaleTime<number, number>;
    updateScale() {
        this.scale = d3.scaleTime().range([this.height, this.width]);    // Yの描画範囲
        if (this.scale) {
            this.scale.domain([this.min, this.max]);
        }
        return this.scale;
    }

}