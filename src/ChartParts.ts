import { Layout } from ".";
import { Selection } from "d3-selection";
import { BaseType } from "d3";
import { util } from "./util";

export interface ChartCanvas extends Selection<BaseType, {}, HTMLElement, any> {

}
export interface ChartParts {
    id: string;
    size: Layout.Size;
    canvas: ChartCanvas | undefined;
    draw(animate: number): void;
}
export abstract class ChartPartsImpl implements ChartParts {
    constructor() {
        this.id = util.id();
        this.size = new Layout.Size();
    }
    id: string;
    size: Layout.Size;
    canvas: ChartCanvas | undefined;
    abstract draw(animate: number): void;
    private parts: ChartParts[] = [];
    addParts(parts: ChartParts) {
        if (!this.parts.some((p) => p.id === parts.id)) {
            this.parts.push(parts);
        }
    }
    protected drawChild(animate: number) {
        if (!this.canvas) throw "no canvas";
        for (const part of this.parts) {
            if (!part.canvas) {
                part.canvas = this.canvas.append("g");
            }
            part.draw(animate);
        }
    }

}

export interface ChartDataParts<T> extends ChartParts {
    loadData(data: T[], reset?: boolean): void;
    clearData(): void;
}