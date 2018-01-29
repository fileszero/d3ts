import * as d3 from "d3";
import { DSVParsedArray, DSVRowString, DSVRowAny } from "d3";

export namespace File {
    export async function csv(url: string): Promise<DSVParsedArray<DSVRowString>> {
        return new Promise<DSVParsedArray<DSVRowString>>((resolve, reject) => {
            try {
                d3.csv(url, (error: any, d: DSVParsedArray<DSVRowString>): void => {
                    error ? reject(error) : resolve(d);
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

    export async function csvParsed<ParsedRow extends DSVRowAny>(url: string, row: (rawRow: DSVRowString, index: number, columns: string[]) => ParsedRow): Promise<DSVParsedArray<ParsedRow>> {
        return new Promise<DSVParsedArray<ParsedRow>>((resolve, reject) => {
            try {
                d3.csv(url, row, (error: any, d: DSVParsedArray<ParsedRow>): void => {
                    error ? reject(error) : resolve(d);
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

}