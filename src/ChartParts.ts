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
    parent: ChartParts | undefined;
    shape: ChartCanvas | undefined;
    visible: boolean;
    draw(animate: number): void;
    //append(tag: string): ChartCanvas;
    append(tag: string): ChartCanvas;
    append(parts: ChartParts): void;
    remove(child?: ChartParts): void;
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
            this._shape = d3.select(canvasSelector).append(shapeTag);
        }
    }
    public id: string;
    parent: ChartParts | undefined;
    visible: boolean = true;

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
    // public canvas: ChartCanvas | undefined;
    /** パーツ本体 */
    private _shapeTag: string;
    private _shape: ChartCanvas | undefined;
    public get shape(): ChartCanvas | undefined {
        if (this._shape) return this._shape;
        if (!this.parent) return undefined;
        if (this._shapeTag === ".") {
            return this.parent.shape;
        }
        this._shape = this.parent.append(this._shapeTag).attr("id", this.id);
        return this._shape;
    }

    protected parts: ChartParts[] = [];
    append(tag: string | ChartParts): any {
        if (typeof tag === "string") {
            if (!this.shape) throw "no shape";
            return this.shape.append(tag);
        } else {
            if (!this.parts.some((p) => p.id === tag.id)) {
                this.parts.push(tag);
            }
            tag.parent = this;
        }
    }
    draw(animate: number = 500): void {
        if (this.shape) {
            const anime = this.shape.transition().duration(animate);
            if (!this.visible) {
                anime.style("opacity", 0)
                return;
            }
            anime.style("opacity", 1)
            this.drawSelf(this.shape, animate);
            if ((this.margin.left != 0 || this.margin.top != 0)) {
                this.shape.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
            }
        }
        this.drawChild(animate);
    }
    remove(child?: ChartParts): void {
        if (child) {    // remove child
            this.parts.some((p, i) => {
                if (p.id === child.id) this.parts.splice(i, 1);
                return false;
            });
            child.parent = undefined;
            child.remove();
        } else {    // remove self
            for (const part of this.parts) {
                part.remove();
            }
            if (this.parent) {
                this.parent.remove(this);
            }
            if (this.shape) {
                this.shape.remove();
            }
        }
    }
    /** 描画本体 */
    protected abstract drawSelf(canvas: ChartCanvas, animate: number): void;

    private drawChild(animate: number) {
        for (const part of this.parts) {
            part.draw(animate);
        }
    }

}

export interface ChartDataParts<Tx> {
    loadData(data: Tx[]): void;
    clearData(): void;
    hasData: boolean;
}
function IsChartDataPartsImpl<Tx>(part: any): part is ChartDataPartsImpl<Tx> {
    return (<ChartDataParts<Tx>>part).clearData !== undefined;
}
export abstract class ChartDataPartsImpl<Tx> extends ChartPartsImpl implements ChartParts, ChartDataParts<Tx> {
    protected data: Tx[] | undefined;
    loadData(data: Tx[]): void {
        this.data = data;
    }
    clearData(): void {
        this.data = undefined;
        for (const part of this.parts) {
            if (IsChartDataPartsImpl<Tx>(part)) {
                part.clearData();
            }
        }
    }
    get hasData(): boolean {
        return this.data !== undefined;
    }

    public for: string | undefined; // ラベルとかでリンク先記録ように使用

    ensureParts<PT extends ChartDataParts<any> & ChartParts>(parts: PT[], newFunc: () => PT, setup: (part: PT, data: Tx, idx: number) => void, parent?: ChartParts) {
        if (!this.data) return;
        parts.forEach((p) => p.clearData());
        for (let i = 0; i < this.data.length; i++) {
            const ts = this.data[i];
            if (parts.length <= i) {
                let part = newFunc();
                parts.push(part);
                if (parent) {
                    parent.append(part)
                } else {
                    this.append(part);   // 描画設定
                }
            }
            setup(parts[i], ts, i);
        }
        parts.forEach((p) => {
            if (!p.hasData) p.remove();
        });
        if (parts.length > this.data.length) {
            parts.splice(this.data.length);
        }

    }

}