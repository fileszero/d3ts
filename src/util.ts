import { ChartCanvas, SvgAttr, ChartTransition } from ".";

export namespace util {
    export function id(): string {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    export function isDate(val: Date | any): val is Date {
        return (<Date>val).getDate !== undefined;
    }
    export function isNumber(val: number | any): val is number {
        return (<number>val).toPrecision !== undefined;
    }

    export function applySvgAttr(canvas: ChartCanvas | ChartTransition, svgAttr: SvgAttr): ChartCanvas | ChartTransition {
        let result = canvas;
        for (let attr in svgAttr) {
            const val = svgAttr[attr];
            if (val) {
                result = result.attr(attr.replace('_', '-'), val)
            }
        }
        return result;
    }
}