export class PlotData<Tx extends number | Date>{
    public x: Tx | undefined;
    public y: number | undefined;
}

export class LineSeriesData<Tx extends number | Date> {
    public name: string = "default";
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