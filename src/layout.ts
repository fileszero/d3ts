import { Selection } from "d3-selection";
import { BaseType } from "d3";

export namespace Layout {
    export interface ISize {
        width: number;
        height: number;
    }
    export class Size implements ISize {
        constructor(src?: ISize, onChange?: (size: Size) => void) {
            if (src) {
                this.width = src.width;
                this.height = src.height;
            }
            this.onChange = onChange;
        }
        private onChange: ((size: Size) => void) | undefined;
        private changed() {
            if (this.onChange) this.onChange(this);
        }
        private _data = { width: 0, height: 0 };
        get width() { return this._data.width; }
        set width(val: number) {
            this._data.width = val;
            this.changed();
        }
        get height() { return this._data.height; }
        set height(val: number) {
            this._data.height = val;
            this.changed();
        }
    }
    export interface IMargin {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }
    export class Margin implements IMargin {
        constructor(src?: IMargin, onChange?: (margin: Margin) => void) {
            if (src) {
                this.top = src.top;
                this.right = src.right;
                this.bottom = src.bottom;
                this.left = src.left;
            }
        }
        private onChange: ((margin: Margin) => void) | undefined;
        private changed() {
            if (this.onChange) this.onChange(this);
        }

        private _data: IMargin = { top: 0, right: 0, bottom: 0, left: 0 }
        get top() { return this._data.top; }
        set top(val: number) {
            this._data.top = val;
            this.changed();
        }
        get right() { return this._data.right; }
        set right(val: number) {
            this._data.right = val;
            this.changed();
        }
        get bottom() { return this._data.bottom; }
        set bottom(val: number) {
            this._data.bottom = val;
            this.changed();
        }
        get left() { return this._data.left; }
        set left(val: number) {
            this._data.left = val;
            this.changed();
        }

    }

    export function getContentsSize(container: Layout.Size, margin: Layout.Margin): Layout.Size {
        const result = new Layout.Size({
            width: container.width - margin.left - margin.right,
            height: container.height - margin.top - margin.bottom
        });
        return result;
    }
    export function getSize(svg: Selection<BaseType, {}, HTMLElement, any>): Layout.Size {
        const svgSize = new Layout.Size({
            width: parseInt(svg.attr("width")),
            height: parseInt(svg.attr("height"))
        });
        return svgSize;
    }

}