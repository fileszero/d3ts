import * as d3 from "d3";

d3.select("body").append("p").text("Hello from D3.js");

function SimpleCircle(): void {
    const width: number = 960;
    const height: number = 700;

    // tslint:disable-next-line:typedef
    const svg = d3.select("body").append("svg");

    svg.attr("width", width).attr("height", height);

    svg.append("circle")
        .attr("cx", 50)
        .attr("cy", 50)
        .attr("r", 20)
        .attr("fill", "green")
        .attr("stroke-width", 3)
        .attr("stroke", "orange");
}

SimpleCircle();