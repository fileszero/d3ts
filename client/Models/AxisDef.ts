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
abstract class AxisDef {
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>) {
        this.parentArea = parentArea;
    }

    public name: string;

    //
    abstract updateScale(): AxisScale<number | Date | { valueOf(): number; }>;

    // 表示属性
    public className: string;
    public axis: d3.Axis<number | Date | { valueOf(): number; }>;
    public color: string;
    public position: AxisPosition;
    public positionOffset: number = 0;

    // 表示エリア
    public parentArea: Selection<BaseType, {}, HTMLElement, any>;
    public drawArea: Selection<BaseType, {}, HTMLElement, any>;

    protected max?: number | Date;
    protected min?: number | Date;
    domain(values: (number | Date)[], reset: boolean = false) {
        if (reset) {
            this.max = undefined;
            this.min = undefined;
        }
        const max = d3.max(values);
        if (max) {
            if (!this.max || max > this.max) this.max = max;
        }
        const min = d3.min(values);
        if (min) {
            if (!this.min || min < this.min) this.min = min;
        }
        this.updateScale();
    }
    range(): number[] {
        return this.mScale.range();
    }
    protected mScale: ScaleTime<number, number> | ScaleLinear<number, number>;
    getScale(): ScaleTime<number, number> | ScaleLinear<number, number> {
        return this.mScale;
    }
    scale(val: number | Date): number {
        if (typeof val === "number") {
            return (<ScaleLinear<number, number>>this.mScale)(val);
        }
        if ((<Date>val).getDate) {
            return (<ScaleTime<number, number>>this.mScale)(val);
        }
        return 0;
    }

    Zoom(range: number[]) {
        if (!range) {
            range = this.mScale.range();
        }
        const newXDomain = range.map((r) => this.mScale.invert(r));
        this.domain(newXDomain);
        return range;
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

    show(animate: number = 500): void {
        if (!this.drawArea) {
            this.drawArea = this.parentArea.append("g");
        }
        this.drawArea.exit().remove();
        this.drawArea
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
            this.drawArea.attr("transform", "translate(" + x_offset + ", " + y_offset + " )");
        }

        this.drawArea.transition().duration(animate)
            .call(<any>this.axis);
    }

    remove(): void {
        this.parentArea.select("." + this.className).remove();
    }
}
export class YAxisDef extends AxisDef {
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>, name: string) {
        super(parentArea);
        this.name = name;
        this.className = "yaxis--" + name
        this.position = AxisPosition.Left;
    }
    // public scale: ScaleLinear<number, number>;

    updateScale() {
        this.mScale = d3.scaleLinear().range([this.height, this.width]);    // Yの描画範囲
        if (this.mScale && this.max && this.min) {
            this.mScale.domain([this.min, this.max]);
        }
        return this.mScale;
    }
}

export class XAxisDef extends AxisDef {
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>, name: string) {
        super(parentArea);
        this.name = name;
        this.className = "xaxis--" + name
        this.position = AxisPosition.Bottom;
    }
    // public scale: ScaleTime<number, number>;
    updateScale() {
        this.mScale = d3.scaleTime().range([this.height, this.width]);    // Yの描画範囲
        if (this.mScale && this.max && this.min) {
            this.mScale.domain([this.min, this.max]);
        }
        return this.mScale;
    }

}