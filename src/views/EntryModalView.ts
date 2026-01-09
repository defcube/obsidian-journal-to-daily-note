import { Modal, App, Platform, moment } from "obsidian";
import { TagSuggesterView } from "./TagSuggesterView";
import { EntryResult } from "../types";

/**
 * Modal for creating a journal entry.
 */
export class EntryModalView extends Modal {
  private timestamp: string;
  private entry = "";
  private inputEl: HTMLInputElement | null = null;
  private suggester: TagSuggesterView | null = null;

  constructor(
    app: App,
    private defaultEntryText: string,
    private onSubmit: (result: EntryResult) => void,
  ) {
    super(app);
    const m = window.moment || moment;
    this.timestamp = m().format("HH:mm");
  }

  onOpen(): void {
    const { contentEl } = this;

    if (Platform.isMobile) {
      this.modalEl.style.marginBottom = "auto";
      this.modalEl.style.marginTop = "25vh";
    }

    // Header Row
    const headerDiv = contentEl.createDiv();
    headerDiv.style.display = "flex";
    headerDiv.style.justifyContent = "space-between";
    headerDiv.style.alignItems = "center";
    headerDiv.style.marginBottom = "20px";

    headerDiv.createEl("h2", { text: "Journal entry" });

    // Time Input
    const timeContainer = headerDiv.createDiv();
    const timeInput = timeContainer.createEl("input", {
      type: "time",
      value: this.timestamp,
    });
    timeInput.addClass("journal-time-input");
    // Native time input needs more width than text input
    timeInput.style.textAlign = "center";
    timeInput.addEventListener("input", (e) => {
      this.timestamp = (e.target as HTMLInputElement).value;
    });
    timeInput.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        this.submit();
      }
    });

    // Refocus main input on blur
    timeInput.addEventListener("blur", () => {
      this.inputEl?.focus();
    });

    // Main Input
    this.inputEl = contentEl.createEl("input", {
      type: "text",
      placeholder: "Type your entry...",
    });
    this.inputEl.addClass("journal-main-input");
    this.inputEl.style.width = "100%";
    this.inputEl.style.fontSize = "1.1em";
    this.inputEl.style.padding = "8px";

    // Tag Suggester
    this.suggester = new TagSuggesterView(this.app, this.inputEl);

    // Enter to submit
    this.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        this.submit();
      }
    });

    // Focus immediately
    setTimeout(() => this.inputEl?.focus(), 10);

    // Footer Buttons
    const buttonContainer = contentEl.createDiv();
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.marginTop = "20px";
    buttonContainer.style.gap = "10px";

    const cancelButton = buttonContainer.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => {
      this.close();
    });

    const okButton = buttonContainer.createEl("button", { text: "OK" });
    okButton.addClass("mod-cta");
    okButton.addEventListener("click", () => {
      this.submit();
    });
  }

  private submit(): void {
    this.entry = this.inputEl?.value || "";
    if (!this.entry || this.entry.trim() === "") {
      this.entry = this.defaultEntryText;
    }
    this.close();
    this.onSubmit({ entry: this.entry, timestamp: this.timestamp });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
    if (this.suggester) {
      this.suggester.destroy();
    }
  }
}
