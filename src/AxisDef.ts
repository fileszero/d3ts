import * as d3 from "d3";
import { Selection } from "d3-selection";
import { ScaleLinear, Line, Simulation, color, BaseType, ScaleTime, min, AxisScale, Axis } from "d3";
import { ChartDataParts, Layout, ScaleParts, Scale, ChartParts, Fill } from ".";
import { util } from "./util";

export interface AxisAttr extends Fill {
    stroke: string | undefined;
}

export type AxisValueType = number | Date;
export abstract class AxisArea extends ChartDataParts<AxisValueType[]> {
    constructor(position: Layout.Position) {
        super("g");
        this.position = position;
    }
    public _scale: Scale = new Scale();
    protected abstract defaultRange(): number[];
    private _range: number[] | undefined;
    protected get range(): number[] {
        if (this._range) return this._range;
        return this.defaultRange();
    }
    protected set range(val: number[]) {
        this._range = val;
    }

    get scale(): Scale {
        this._scale.range = this.range   // [0, this.size.width];
        return this._scale;
    }

    loadData(data: AxisValueType[], reset?: boolean | undefined) {
        super.loadData(data, reset);
        this._scale.loadData(data, reset);
    }
    public position: Layout.Position;  //default
    public positionOffset: number = 0;
    public attr: AxisAttr = <AxisAttr>{};

    drawSelf(animate: number): void {
        if (!this.shape) throw "No shape";
        if (!this.data) throw "No data";

        const axis_scale = this.scale.getD3Scale();
        if (!axis_scale) throw "No scale";

        let axisFunc = d3.axisLeft;   // default left
        let x_offset = 0, y_offset = 0;
        if (this.position === Layout.Position.Left) {
            axisFunc = d3.axisLeft;
            x_offset = this.positionOffset;
        } else if (this.position === Layout.Position.Right) {
            axisFunc = d3.axisRight;
            x_offset = this.positionOffset;
        } else if (this.position === Layout.Position.Top) {
            axisFunc = d3.axisTop;
            y_offset = this.positionOffset;
        } else if (this.position === Layout.Position.Bottom) {
            axisFunc = d3.axisBottom;
            y_offset = this.positionOffset;
        }

        const axis = axisFunc(axis_scale);
        if (x_offset != 0 || y_offset != 0) {
            this.shape.attr("transform", "translate(" + x_offset + ", " + y_offset + " )");
        }

        const anime = this.shape.transition().duration(animate);
        util.applySvgAttr(anime, this.attr);
        anime.call(<any>axis);

    }

    Zoom(range: number[] | undefined): number[] {
        const scale = this.scale.getD3Scale();
        if (scale) {
            range = range || this.defaultRange();
            const newXDomain = range.map((r) => scale.invert(r));
            this.loadData(newXDomain, true);
            return range;
        }
        return [];
    }

}


export class XAxisArea extends AxisArea {
    constructor(position?: Layout.Position) {
        super(position || Layout.Position.Bottom);
    }
    protected defaultRange(): number[] {
        return [0, this.size.width];
    }
}

export class YAxisArea extends AxisArea {
    constructor(position?: Layout.Position) {
        super(position || Layout.Position.Left);
    }
    protected defaultRange(): number[] {
        return [this.size.height, 0];
    }
}

export class XYAxis implements ScaleParts {
    constructor(name: string, x: XAxisArea, y: YAxisArea) {
        this.xAxis = x;
        this.yAxis = y;
        this.name = name;
    }
    public name: string;
    xAxis: XAxisArea;
    yAxis: YAxisArea;
    get xscale(): Scale | undefined {
        return this.xAxis.scale;
    }
    get yscale(): Scale | undefined {
        return this.yAxis.scale;
    }
}

