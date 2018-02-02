import { ValueFn, BaseType } from "d3";

export interface SvgAttr {
    // https://qiita.com/sanonosa/items/e01d0bce67b760c0bc
    [key: string]: (string | number | undefined);  // シグネチャー    for loop []で必要
}
export interface Fill extends SvgAttr {
    fill: string | undefined;
    fillOpacity: number | undefined;
    fillRule: string | undefined;
}

