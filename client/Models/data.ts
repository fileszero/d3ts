export class PlotData<Tx extends number | Date>{
    public x: Tx;
    public y: number;
}

export class LineSeriesData<Tx extends number | Date> {
    public name: string;
    public yAxis: string;
    public color: string;
    public width: number = 1;
    public data: PlotData<Tx>[] = [];
}