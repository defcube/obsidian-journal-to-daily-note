import { App } from "obsidian";
import { SettingsModel } from "../models/SettingsModel";
import { JournalService } from "../services/JournalService";
import { NotificationService } from "../services/NotificationService";
import { EntryModalView } from "../views/EntryModalView";

/**
 * Controller for journal entry creation.
 */
export class JournalController {
  constructor(
    private app: App,
    private settingsModel: SettingsModel,
    private journalService: JournalService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create a journal entry for the active file.
   */
  async createEntry(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      this.notificationService.notice("No active file. Cannot log entry.");
      return;
    }

    let dailyNote = this.journalService.getDailyNote();
    if (!dailyNote) {
      dailyNote = await this.journalService.createDailyNote();
    }

    if (!dailyNote) {
      this.notificationService.notice(
        "Daily note could not be found or created.",
      );
      return;
    }

    new EntryModalView(
      this.app,
      this.settingsModel.defaultEntryText,
      async (result) => {
        try {
          await this.journalService.logEntry(
            activeFile,
            result.entry,
            result.timestamp,
          );
        } catch (error) {
          this.notificationService.notice(
            `Failed to log entry: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    ).open();
  }
}
