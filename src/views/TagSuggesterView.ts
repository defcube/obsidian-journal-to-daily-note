import { App } from "obsidian";

/**
 * A lightweight suggester for hashtags in a standard input.
 */
export class TagSuggesterView {
  private containerEl: HTMLDivElement;
  private suggestions: string[] = [];
  private selectedIndex = 0;
  private currentRange: { start: number; end: number } | null = null;
  private boundOnInput: () => void;
  private boundOnKeydown: (e: KeyboardEvent) => void;
  private boundOnBlur: () => void;

  constructor(
    private app: App,
    private inputEl: HTMLInputElement,
  ) {
    this.containerEl = document.body.createDiv("suggestion-container");
    this.containerEl.style.position = "absolute";
    this.containerEl.style.zIndex = "9999";
    this.containerEl.style.display = "none";
    this.containerEl.addClass("popover");
    this.containerEl.addClass("suggestion-item-group");

    this.boundOnInput = this.onInput.bind(this);
    this.boundOnKeydown = this.onKeydown.bind(this);
    this.boundOnBlur = () => setTimeout(() => this.close(), 200);

    this.inputEl.addEventListener("input", this.boundOnInput);
    this.inputEl.addEventListener("keydown", this.boundOnKeydown);
    this.inputEl.addEventListener("blur", this.boundOnBlur);
  }

  private onInput(): void {
    const cursorValues = this.getCursorValues();
    if (!cursorValues) {
      this.close();
      return;
    }

    const { word, range } = cursorValues;
    const allTags = Object.keys(this.app.metadataCache.getTags()).map((t) =>
      t.slice(1),
    );
    const matches = allTags.filter((tag) =>
      tag.toLowerCase().startsWith(word.toLowerCase()),
    );

    if (matches.length > 0) {
      this.show(matches, range);
    } else {
      this.close();
    }
  }

  private getCursorValues(): {
    word: string;
    range: { start: number; end: number };
  } | null {
    const cursor = this.inputEl.selectionStart;
    if (cursor === null) return null;

    const text = this.inputEl.value;
    const textBefore = text.slice(0, cursor);
    const hashIndex = textBefore.lastIndexOf("#");

    if (hashIndex === -1) return null;

    const afterHash = textBefore.slice(hashIndex + 1);
    if (/\s/.test(afterHash)) return null;

    return {
      word: afterHash,
      range: { start: hashIndex + 1, end: cursor },
    };
  }

  private show(items: string[], range: { start: number; end: number }): void {
    this.suggestions = items;
    this.currentRange = range;
    this.selectedIndex = 0;

    this.containerEl.empty();
    this.containerEl.style.display = "block";

    const rect = this.inputEl.getBoundingClientRect();
    this.containerEl.style.top = rect.bottom + 5 + "px";
    this.containerEl.style.left = rect.left + "px";
    this.containerEl.style.width = rect.width + "px";
    this.containerEl.style.maxHeight = "200px";
    this.containerEl.style.overflowY = "auto";
    this.containerEl.style.backgroundColor = "var(--background-secondary)";
    this.containerEl.style.border =
      "1px solid var(--background-modifier-border)";
    this.containerEl.style.boxShadow = "var(--shadow-s)";

    items.forEach((item, index) => {
      const el = this.containerEl.createDiv("suggestion-item");
      el.innerText = item;
      el.addEventListener("click", () => this.select(item));
      el.addEventListener("mouseenter", () => {
        this.selectedIndex = index;
        this.renderSelection();
      });
      if (index === 0) el.addClass("is-selected");
    });
  }

  private renderSelection(): void {
    const items = this.containerEl.querySelectorAll(".suggestion-item");
    items.forEach((item, index) => {
      if (index === this.selectedIndex) item.addClass("is-selected");
      else item.removeClass("is-selected");
    });
  }

  private close(): void {
    this.containerEl.style.display = "none";
    this.suggestions = [];
  }

  private onKeydown(e: KeyboardEvent): void {
    if (this.suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
      this.renderSelection();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.selectedIndex =
        (this.selectedIndex - 1 + this.suggestions.length) %
        this.suggestions.length;
      this.renderSelection();
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      this.select(this.suggestions[this.selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.close();
    }
  }

  private select(tag: string): void {
    if (!this.currentRange) return;

    const text = this.inputEl.value;
    const { start, end } = this.currentRange;

    const before = text.slice(0, start);
    const after = text.slice(end);

    const newValue = before + tag + " " + after;
    this.inputEl.value = newValue;

    const newCursor = start + tag.length + 1;
    this.inputEl.setSelectionRange(newCursor, newCursor);

    this.close();
    this.inputEl.focus();
  }

  destroy(): void {
    this.inputEl.removeEventListener("input", this.boundOnInput);
    this.inputEl.removeEventListener("keydown", this.boundOnKeydown);
    this.inputEl.removeEventListener("blur", this.boundOnBlur);
    this.containerEl.remove();
  }
}
