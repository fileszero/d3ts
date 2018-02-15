import { ChartCanvas, SvgAttr, ChartTransition, SvgEvent } from ".";

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
    export function applySvgStyle(canvas: ChartCanvas | ChartTransition, svgAttr: SvgAttr): ChartCanvas | ChartTransition {
        let result = canvas;
        result.attr("style", null);
        for (let attr in svgAttr) {
            const val = svgAttr[attr];
            if (val) {
                if (attr.match(/(class)/i)) {
                    result = result.attr(attr.replace('_', '-'), val)
                } else {
                    result = result.style(attr.replace('_', '-'), val)
                }
            }
        }
        return result;
    }
    export function applySvgEvent(canvas: ChartCanvas | ChartTransition, svgEvent: SvgEvent): ChartCanvas | ChartTransition {
        let result = canvas;
        for (let event in svgEvent) {
            const val = svgEvent[event];
            if (val) {
                let event_name = event.replace('_', '-').replace(/^on/, '');

                result = result.on(event_name, val);
            }
        }
        return result;
    }

}