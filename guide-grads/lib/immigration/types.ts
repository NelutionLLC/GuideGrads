/** Shared metadata for sourced immigration reference content. */
export type SourceRef = {
  label: string;
  url: string;
};

export type DatedSource = SourceRef & {
  /** ISO date string — when content was verified against the source. */
  lastVerified: string;
};

export type ProcessingRow = {
  category: string;
  rangeOrNote: string;
  notes?: string;
  source: DatedSource;
};
