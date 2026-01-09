/**
 * Plugin settings
 */
export interface DefJournalSettings {
  /** Text to use when submitting an empty entry */
  defaultEntryText: string;
}

/**
 * Result from the entry modal
 */
export interface EntryResult {
  /** The entry text */
  entry: string;
  /** The timestamp (HH:mm format) */
  timestamp: string;
}
