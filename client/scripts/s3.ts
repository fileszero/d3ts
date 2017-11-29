import * as d3 from "d3";

namespace S3Sample {
    d3.select("body").append("p").text("Hello from D3.js Sample 3 http://deep-blend.com/jp/2014/05/d3-js-basic1-svg-data/");

    function DataCircle(): void {
        const width: number = 960;
        const height: number = 700;

        // tslint:disable-next-line:typedef
        const svg = d3.select("body").append("svg");

        const listData: number[] = [30, 70, 60];

        svg.attr("width", width).attr("height", height);

        svg.selectAll("circle") // データをバインドする要素の選択 対象となるタグはまだ存在していません。
            .data(listData)     // データのバインドを開始
            .enter()            // データの数だけ、d3オブジェクトを作成.enterメソッドでdataメソッドで準備された空のオブジェクトにデータを保存します。
            .append("circle")   // データをバインドし、要素を追加.この時点で初めてDOMにタグが挿入されます。
            .attr("r", 10)          // 要素を操作
            .attr("fill", "blue")
            .attr("cx", (d) => { return d * 2; }) // 引数dにはバインドされたデータが入ります。
            .attr("cy", (d, i) => { return (i + 1) * 50; }); // データのインデックスをcyに使う。

    }

    function DataTextAndCircle(): void {
        const width: number = 960;
        const height: number = 700;

        // tslint:disable-next-line:typedef
        const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

        const listData: { subj: string, score: number }[] = [
            { subj: "国語", score: 30 },
            { subj: "数学", score: 70 },
            { subj: "社会", score: 60 },];

        const boxes = svg.selectAll("boxes")    // 要素の数だけ箱を作る
            .data(listData)
            .enter()
            .append("g");                       // 円やテキストのようなグラフィック要素は、必ずgやsvgのようなコンテナ要素の中に入るようにしましょう！

        boxes.append("circle")  // g要素に円要素を加えている。
            .attr("cy", 100)
            .attr("r", 10)
            .attr("fill", "blue")
            .attr("cx", (d) => { return d.score * 2; });

        // g要素にテキスト要素を加えている。
        boxes.append("text")
            .text((d) => { return d.subj; })
            .attr("fill", "gray")
            .attr("y", 80)
            .attr("x", (d) => { return d.score * 2; })
            .attr("font-size", 10);
    }



    DataCircle();
    DataTextAndCircle();
}