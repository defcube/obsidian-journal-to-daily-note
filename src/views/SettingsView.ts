import { App, PluginSettingTab, Setting, Plugin } from "obsidian";
import { SettingsModel } from "../models/SettingsModel";

/**
 * Settings tab for the plugin.
 */
export class SettingsView extends PluginSettingTab {
  constructor(
    app: App,
    plugin: Plugin,
    private settingsModel: SettingsModel,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Default entry text")
      .setDesc(
        'Text to use when submitting an empty entry. Defaults to "✅" if not specified.',
      )
      .addText((text) =>
        text
          .setValue(this.settingsModel.defaultEntryText)
          .onChange(async (value) => {
            await this.settingsModel.setDefaultEntryText(value);
          }),
      );
  }
}
