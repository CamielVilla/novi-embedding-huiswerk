import * as cheerio from "cheerio"

export default function parseHTML(html: string): string {
    const s = cheerio.load(html);
    return s.root().text().trim();
}