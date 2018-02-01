import { Selection } from "d3-selection";
import { BaseType } from "d3";

export namespace Layout {
    export class Size {
        public width: number;
        public height: number;
    }
    export class Margin {
        constructor(src: Margin) {
            this.top = src.top;
            this.right = src.right;
            this.bottom = src.bottom;
            this.left = src.left;
        }
        public top: number;
        public right: number;
        public bottom: number;
        public left: number;
    }

    export function getContentsSize(container: Layout.Size, margin: Layout.Margin): Layout.Size {
        const result: Layout.Size = {
            width: container.width - margin.left - margin.right,
            height: container.height - margin.top - margin.bottom
        }
        return result;
    }
    export function getSize(svg: Selection<BaseType, {}, HTMLElement, any>): Layout.Size {
        const svgSize: Layout.Size = { width: parseInt(svg.attr("width")), height: parseInt(svg.attr("height")) };
        return svgSize;
    }

}