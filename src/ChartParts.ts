import { Layout, Scale } from ".";
import { Selection } from "d3-selection";
import { BaseType, Transition, EnterElement } from "d3";
import { util } from "./util";
import d3 = require("d3");

export interface ChartCanvas extends Selection<BaseType, {}, HTMLElement, any> {
}
export interface ChartTransition extends Transition<Element | EnterElement | Document | Window | null, {}, HTMLElement, any> {
}

export interface ChartParts {
    id: string;
    size: Layout.Size;
    margin: Layout.Margin;
    canvas: ChartCanvas | undefined;
    draw(animate: number): void;
}

export interface ScaleParts {
    xscale: Scale | undefined;
    yscale: Scale | undefined;
}
export abstract class ChartPartsImpl implements ChartParts {
    constructor(shapeTag: string, canvasSelector?: string) {
        this.id = util.id();
        this._shapeTag = shapeTag;
        this._size = new Layout.Size(undefined, this.onResize);
        this._margin = new Layout.Margin(undefined, this.onMove);
        if (canvasSelector) {
            this.canvas = d3.select(canvasSelector);
        }
    }
    public id: string;
    // サイズ
    private _size: Layout.Size;
    get size() { return this._size; }
    set size(val: Layout.Size) { this._size = val; }
    onResize(size: Layout.Size) { }

    //位置
    private _margin: Layout.Margin;
    get margin() { return this._margin; }
    set margin(val: Layout.Margin) { this._margin = val; }
    onMove(margin: Layout.Margin) { }


    /** パーツを書く場所 */
    public canvas: ChartCanvas | undefined;
    /** パーツ本体 */
    private _shapeTag: string;
    private _shape: ChartCanvas | undefined;
    protected get shape(): ChartCanvas | undefined {
        if (this._shape) return this._shape;
        if (!this.canvas) return undefined;
        this._shape = this.canvas.append(this._shapeTag).attr("id", this.id);
        return this._shape;
    }

    draw(animate: number): void {
        if (!this.canvas) throw "no canvas of " + this.id;
        this.drawSelf(animate);
        if (this.shape && (this.margin.left != 0 || this.margin.top != 0)) {
            this.shape.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        }
        this.drawChild(animate);
    }
    /** 描画本体 */
    protected abstract drawSelf(animate: number): void;

    private parts: ChartParts[] = [];
    addParts(parts: ChartParts) {
        if (!this.parts.some((p) => p.id === parts.id)) {
            this.parts.push(parts);
        }
    }
    private drawChild(animate: number) {
        if (!this.shape) throw "no canvas";
        for (const part of this.parts) {
            if (!part.canvas) {
                part.canvas = this.shape;  //.append("g");
            }
            part.draw(animate);
        }
    }

}

export abstract class ChartDataParts<Tx> extends ChartPartsImpl implements ChartParts {
    protected data: Tx | undefined;
    loadData(data: Tx, reset?: boolean | undefined): void {
        if (reset) this.clearData();
        this.data = data;

    }
    clearData(): void {
        if (this.shape) {
            this.shape.remove();
        }
        this.data = undefined;
    }
}