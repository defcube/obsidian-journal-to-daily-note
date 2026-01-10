import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS } from "./constants";
import { DefJournalSettings } from "./types";

// Models
import { SettingsModel } from "./models/SettingsModel";

// Services
import { JournalService } from "./services/JournalService";
import { NotificationService } from "./services/NotificationService";

// Views
import { SettingsView } from "./views/SettingsView";

// Controllers
import { JournalController } from "./controllers/JournalController";

export default class DefJournalPlugin extends Plugin {
  private settingsModel!: SettingsModel;
  private journalService!: JournalService;
  private notificationService!: NotificationService;
  private journalController!: JournalController;

  async onload(): Promise<void> {
    // Load settings
    const savedData =
      (await this.loadData()) as Partial<DefJournalSettings> | null;
    this.settingsModel = new SettingsModel(
      Object.assign({}, DEFAULT_SETTINGS, savedData),
      async (settings: DefJournalSettings) => {
        await this.saveData(settings);
      },
    );

    // Initialize Services
    this.notificationService = new NotificationService();
    this.journalService = new JournalService(this.app, this.settingsModel);

    // Initialize Controller
    this.journalController = new JournalController(
      this.app,
      this.settingsModel,
      this.journalService,
      this.notificationService,
    );

    // Add settings tab
    this.addSettingTab(new SettingsView(this.app, this, this.settingsModel));

    // Register command
    this.addCommand({
      id: "create-entry",
      name: "Add entry to daily note",
      callback: () => this.journalController.createEntry(),
    });
  }

  onunload(): void {
    // Clean up resources when plugin is disabled
  }
}
