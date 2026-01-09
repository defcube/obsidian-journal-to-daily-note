import * as moment from "moment";

// Mock obsidian module
jest.mock(
  "obsidian",
  () => {
    return {
      Plugin: class {},
      PluginSettingTab: class {},
      Setting: class {
        setName(): this {
          return this;
        }
        setDesc(): this {
          return this;
        }
        addText(): this {
          return this;
        }
      },
      Modal: class {
        app: unknown;
        contentEl: HTMLElement;
        modalEl: HTMLElement;

        constructor() {
          this.contentEl = document.createElement("div");
          this.modalEl = document.createElement("div");
        }

        open(): void {}
        close(): void {}
      },
      Platform: {
        isMobile: false,
      },
      Notice: class {},
      TFile: class {
        path = "";
        basename = "";
      },
      moment: moment,
    };
  },
  { virtual: true },
);
