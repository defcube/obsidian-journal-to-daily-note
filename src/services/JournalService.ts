import { App, TFile, moment } from "obsidian";
import {
  getDailyNote,
  createDailyNote,
  getAllDailyNotes,
} from "obsidian-daily-notes-interface";
import { SettingsModel } from "../models/SettingsModel";
import { JOURNAL_HEADER, DEFAULT_SETTINGS } from "../constants";

/**
 * Service for logging entries to daily notes.
 */
export class JournalService {
  constructor(
    private app: App,
    private settingsModel: SettingsModel,
  ) {}

  /**
   * Get the daily note file for today.
   */
  getDailyNote(): TFile | null {
    const m = window.moment || moment;
    return getDailyNote(m(), getAllDailyNotes());
  }

  /**
   * Create a daily note for today.
   */
  async createDailyNote(): Promise<TFile> {
    const m = window.moment || moment;
    return await createDailyNote(m());
  }

  /**
   * Log an entry to the daily note under the source file's block.
   * If note is empty, uses defaultEntryText from settings (or "✅" if unset).
   */
  async logEntry(
    sourceFile: TFile,
    note: string,
    timestamp: string | null,
  ): Promise<void> {
    let entryText = note.trim();
    if (entryText.length === 0) {
      const settingsDefault = this.settingsModel.defaultEntryText.trim();
      entryText =
        settingsDefault.length > 0
          ? settingsDefault
          : DEFAULT_SETTINGS.defaultEntryText;
    }

    const m = window.moment || moment;
    const time = timestamp || m().format("HH:mm");

    const file = this.getDailyNote();

    if (!file) {
      throw new Error("Daily note not found");
    }

    const linkText = `[[${sourceFile.basename}]]`;
    const noteLine = `${time} - ${entryText}`;

    const content = await this.app.vault.read(file);
    const newContent = this.insertEntry(content, linkText, noteLine);
    await this.app.vault.modify(file, newContent);
  }

  /**
   * Insert an entry into the daily note content.
   */
  private insertEntry(
    content: string,
    linkText: string,
    noteLine: string,
  ): string {
    const basename = linkText.slice(2, -2); // Extract basename from [[basename]]

    if (content.includes(JOURNAL_HEADER)) {
      // Escape special regex characters in basename
      const escapedBasename = basename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const linkRegex = new RegExp(`^\\[\\[${escapedBasename}\\]\\]`, "m");
      const match = content.match(linkRegex);

      if (match && match.index !== undefined) {
        // Found existing block - append entry to it
        return this.appendToExistingBlock(content, match, noteLine);
      } else {
        // No existing block - create new block at bottom of section
        return this.appendNewBlock(content, linkText, noteLine);
      }
    } else {
      // No header - create section at end
      return this.createNewSection(content, linkText, noteLine);
    }
  }

  private appendToExistingBlock(
    content: string,
    match: RegExpMatchArray,
    noteLine: string,
  ): string {
    const startIndex = match.index! + match[0].length;
    const afterMatch = content.slice(startIndex);
    const nextDoubleNewline = afterMatch.search(/\n\n/);

    if (nextDoubleNewline !== -1) {
      const insertionPoint = startIndex + nextDoubleNewline;
      return (
        content.slice(0, insertionPoint) +
        "\n" +
        noteLine +
        content.slice(insertionPoint)
      );
    } else {
      if (content.endsWith("\n")) {
        return content.trimEnd() + "\n" + noteLine + "\n";
      } else {
        return content + "\n" + noteLine;
      }
    }
  }

  private appendNewBlock(
    content: string,
    linkText: string,
    noteLine: string,
  ): string {
    const newBlock = `${linkText}\n${noteLine}`;
    const headerIndex = content.indexOf(JOURNAL_HEADER);
    const afterHeaderIndex = headerIndex + JOURNAL_HEADER.length;
    const afterHeader = content.slice(afterHeaderIndex);

    // Find the start of the next section
    const nextSectionMatch = afterHeader.match(/\n#{1,6}\s/);

    if (nextSectionMatch && nextSectionMatch.index !== undefined) {
      const insertionIndex = afterHeaderIndex + nextSectionMatch.index;
      return (
        content.slice(0, insertionIndex) +
        "\n\n" +
        newBlock +
        content.slice(insertionIndex)
      );
    } else {
      if (content.endsWith("\n")) {
        return content.trimEnd() + "\n\n" + newBlock + "\n";
      } else {
        return content + "\n\n" + newBlock;
      }
    }
  }

  private createNewSection(
    content: string,
    linkText: string,
    noteLine: string,
  ): string {
    const newBlock = `${linkText}\n${noteLine}`;
    if (content.endsWith("\n")) {
      return content + `${JOURNAL_HEADER}\n\n${newBlock}`;
    } else {
      return content + `\n\n${JOURNAL_HEADER}\n\n${newBlock}`;
    }
  }
}
