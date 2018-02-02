import { Layout } from ".";
import { Selection } from "d3-selection";
import { BaseType } from "d3";

export interface ChartSelection extends Selection<BaseType, {}, HTMLElement, any> {

}
export interface ChartParts {
    id: string;
    size: Layout.Size;

    draw(animate: number): void;
}
export interface ChartDataParts<T> extends ChartParts {
    loadData(data: T[], reset?: boolean): void;
    clearData(): void;
}