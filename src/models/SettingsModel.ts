import { DefJournalSettings } from "../types";

/**
 * Model for managing plugin settings.
 */
export class SettingsModel {
  constructor(
    private settings: DefJournalSettings,
    private onSave: (settings: DefJournalSettings) => Promise<void>,
  ) {}

  get defaultEntryText(): string {
    return this.settings.defaultEntryText;
  }

  async setDefaultEntryText(value: string): Promise<void> {
    this.settings.defaultEntryText = value;
    await this.onSave(this.settings);
  }
}
