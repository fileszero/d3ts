import { Layout } from ".";

export interface ChartParts<T> {
    id: string;
    size: Layout.Size;

    loadData(data: T[], reset?: boolean): void;
    clearData(): void;

    draw(animate: number): void;

    //    addParts(parts: ChartParts, x: number, y: number): void;
}