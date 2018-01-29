import * as d3 from "d3";
import { File } from "../Models";

(async () => {
    const datePerser = d3.timeParse("%b %Y");
    const result = await File.csvParsed<{ date?: Date, price?: number }>("./sp500.csv", (row, idx, cols) => {
        console.log("row:" + row);
        var r: { date?: Date, price?: number } = {};
        r.date = datePerser(row["date"] || "") || undefined;
        r.price = parseFloat(row["price"] || "") || undefined;
        return r;
    });
    let ele = document.getElementById("parsed_result");
    if (ele) {
        ele.innerText = JSON.stringify(result);
    }

    const string_result = await File.csv("./sp500.csv");
    ele = document.getElementById("string_result");
    if (ele) {
        ele.innerText = JSON.stringify(string_result);
    }
    console.log(result);
})();