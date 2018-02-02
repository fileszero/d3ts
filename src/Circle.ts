import { ChartPartsImpl, ChartParts, ChartCanvas } from ".";

export class Circle extends ChartPartsImpl implements ChartParts {
    drawSelf(canvas: ChartCanvas, animate: number): void {
        canvas.append("circle")

            .attr('cx', 100)
            .attr('cy', 90)
            .attr('r', 20)
            .transition().duration(animate)
            ;
    }
}
