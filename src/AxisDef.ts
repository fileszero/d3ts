import * as d3 from "d3";
import { Selection } from "d3-selection";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime, min, AxisScale, Axis } from "d3";
import { ChartDataParts, Layout } from ".";
import { util } from "./util";

export enum AxisPosition {
    Top,
    Right,
    Bottom,
    Left
}
export abstract class AxisDef implements ChartDataParts<(number | Date)[]> {
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>, name: string, className: string, position: AxisPosition) {
        this.name = name;
        this.className = className;
        this.parentArea = parentArea;
        this.position = position;
        this.canvas = this.parentArea.append("g");
        this.id = util.id();
    }
    public id: string;
    public name: string;

    //
    updateScale(): AxisScale<number | Date | { valueOf(): number; }> | undefined {
        if (this.max && this.min) {
            if (util.isDate(this.max)) {
                this.mScale = d3.scaleTime().range([this.size.height, this.size.width]);    // Yの描画範囲
                this.mScale.domain([this.min, this.max]);
            }
            if (util.isNumber(this.max)) {
                this.mScale = d3.scaleLinear().range([this.size.height, this.size.width]);    // Yの描画範囲
                this.mScale.domain([this.min, this.max]);
            }
        }
        return this.mScale;
    }

    // 表示属性
    public className: string;
    public color: string = "";
    public position: AxisPosition;  //default
    public positionOffset: number = 0;

    // 表示エリア
    public parentArea: Selection<BaseType, {}, HTMLElement, any>;
    public canvas: Selection<BaseType, {}, HTMLElement, any>;

    protected max?: number | Date;
    protected min?: number | Date;
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
        this.updateScale();
    }
    clearData() {
        this.max = undefined;
        this.min = undefined;
    }
    range(): number[] {
        return this.mScale ? this.mScale.range() : [];
    }
    protected mScale: ScaleTime<number, number> | ScaleLinear<number, number> | undefined;
    getScale(): ScaleTime<number, number> | ScaleLinear<number, number> | undefined {
        return this.mScale;
    }
    scale(val: number | Date | undefined): number {
        if (util.isNumber(val)) {
            return (<ScaleLinear<number, number>>this.mScale)(val);
        }
        if (util.isDate(val)) {
            return (<ScaleTime<number, number>>this.mScale)(val);
        }
        return 0;
    }

    Zoom(range: number[] | undefined): number[] {
        if (this.mScale) {
            const scale = this.mScale;
            if (!range) {
                range = scale.range();
            }
            const newXDomain = range.map((r) => scale.invert(r));
            this.loadData(newXDomain);
            return range;
        }
        return [];
    }

    protected mSize: Layout.Size = new Layout.Size({ width: 0, height: 0 }, (size) => this.updateScale());
    get size() {
        return this.mSize;
    }
    set size(val) {
        this.mSize = val;
        this.updateScale();
    }

    draw(animate: number = 500): void {
        const scale = this.updateScale();
        if (!scale) return; // need scale
        this.canvas.exit().remove();
        this.canvas
            .attr("class", this.className)
            .attr("stroke", this.color);
        //.attr("transform", "translate(0," + this.parentArea.size..size.height + ")");
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

        const axis = axisFunc(scale);
        if (x_offset != 0 || y_offset != 0) {
            this.canvas.attr("transform", "translate(" + x_offset + ", " + y_offset + " )");
        }

        this.canvas.transition().duration(animate)
            .call(<any>axis);
    }

    remove(): void {
        this.parentArea.select("." + this.className).remove();
    }

}
export class YAxisDef extends AxisDef {
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>, name: string) {
        super(parentArea, name, "yaxis--" + name, AxisPosition.Left);
    }
}

export class XAxisDef extends AxisDef {
    constructor(parentArea: Selection<BaseType, {}, HTMLElement, any>, name: string) {
        super(parentArea, name, "xaxis--" + name, AxisPosition.Bottom);
    }

}