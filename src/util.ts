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

}