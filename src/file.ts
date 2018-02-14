import * as d3 from "d3";
import { DSVParsedArray, DSVRowString, DSVRowAny } from "d3";

export class File {
    constructor() { }

    static async csv(url: string): Promise<DSVParsedArray<DSVRowString>> {
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

    static async csvParsed<ParsedRow extends DSVRowAny>(url: string, row: (rawRow: DSVRowString, index: number, columns: string[]) => ParsedRow): Promise<DSVParsedArray<ParsedRow>> {
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
    static async csvText(url: string, option?: { header?: number, comment?: RegExp }): Promise<DSVParsedArray<DSVRowString>> {
        return new Promise<DSVParsedArray<DSVRowString>>((resolve, reject) => {
            try {
                d3.text(url, (error: any, csv: string) => {
                    if (error) reject(error);
                    // remove comment rows with regex - not fully tested, but should work
                    option = option || {};
                    if (option.comment) {   // /^[#@][^\r\n]+[\r\n]+/mg
                        csv = csv.replace(option.comment, '');
                    }
                    if (option.header) {
                        const lines = csv.split('\n');
                        lines.splice(0, option.header - 1);
                        csv = lines.join('\n');
                    }
                    //console.log(csv);
                    var data = d3.csvParse(csv);
                    //console.log(data);
                    resolve(data);
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

}