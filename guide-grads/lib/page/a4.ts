/** ISO A4 at 96 CSS px/in — preview layout and PDF export. */
export const mmToPx = (mm: number) => (mm * 96) / 25.4;

export const A4_W = mmToPx(210);
export const A4_H = mmToPx(297);

/** US Letter @ 96 CSS px/in */
export const US_LETTER_W = 8.5 * 96;
export const US_LETTER_H = 11 * 96;

export type PageSize = "a4" | "letter";

export function resolvePageSize(v: unknown): PageSize {
  return v === "a4" ? "a4" : "letter";
}

export function pageDimensions(pageSize: unknown): { pageW: number; pageH: number } {
  return resolvePageSize(pageSize) === "a4"
    ? { pageW: A4_W, pageH: A4_H }
    : { pageW: US_LETTER_W, pageH: US_LETTER_H };
}
