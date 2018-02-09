import { util } from "./util";

export class PlotData<Tx extends number | Date>{
    public x: Tx | undefined;
    public y: number | undefined;
}

export interface SeriesData {
    name: string;
    id: string;
    color: string;
}

export class LineSeriesData<Tx extends number | Date> implements SeriesData {
    constructor() {
        this.id = util.id();
    }
    public name: string = "default";
    public id: string = "";
    public yAxis: string = "default";
    public color: string = "";
    public width: number = 1;
    public data: PlotData<Tx>[] = [];
    get xArray(): (Tx | undefined)[] {
        return this.data.map((d) => d.x);
    }
    get yArray(): (number | undefined)[] {
        return this.data.map((d) => d.y);
    }

}