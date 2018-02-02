export interface Fill {
    // https://qiita.com/sanonosa/items/e01d0bce67b760c0bc
    [key: string]: (string | number | undefined);  // シグネチャー    for loop []で必要
    fill: string | undefined;
    fillOpacity: number | undefined;
    fillRule: string | undefined;
}