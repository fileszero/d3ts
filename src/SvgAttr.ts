import { ValueFn, BaseType } from "d3";

export interface SvgAttr {
    // https://qiita.com/sanonosa/items/e01d0bce67b760c0bc
    [key: string]: (string | number | undefined);  // シグネチャー    for loop []で必要
    class: string | undefined;
}
export interface Fill extends SvgAttr {
    fill: string | undefined;
    fillOpacity: number | undefined;
    fillRule: string | undefined;
}

export type SvgEventHandler = ValueFn<BaseType, {}, void> | undefined;  // (data,index,group);
export interface SvgEvent {
    [key: string]: SvgEventHandler;  // シグネチャー    for loop []で必要
    // onactivate, onclick, onfocusin, onfocusout, onload, onmousedown, onmousemove, onmouseout, onmouseover, onmouseup
}

export interface GraphicalEvent extends SvgEvent {
    onactivate: SvgEventHandler;
    onclick: SvgEventHandler;
    onfocusin: SvgEventHandler;
    onfocusout: SvgEventHandler;
    onload: SvgEventHandler;
    onmousedown: SvgEventHandler;
    onmousemove: SvgEventHandler;
    onmouseout: SvgEventHandler;
    onmouseover: SvgEventHandler;
    onmouseup: SvgEventHandler;
}
export interface DocumentEvent extends SvgEvent {
    onabort: SvgEventHandler;
    onerror: SvgEventHandler;
    onresize: SvgEventHandler;
    onscroll: SvgEventHandler;
    onunload: SvgEventHandler;
}

export interface PartsEvent extends GraphicalEvent, DocumentEvent {

}