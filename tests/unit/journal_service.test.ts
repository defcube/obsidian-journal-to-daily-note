import { JournalService } from "../../src/services/JournalService";
import { SettingsModel } from "../../src/models/SettingsModel";
import { App, TFile } from "obsidian";
import * as DailyNotesInterface from "obsidian-daily-notes-interface";

jest.mock("obsidian-daily-notes-interface", () => ({
  getDailyNote: jest.fn(),
  createDailyNote: jest.fn(),
  getAllDailyNotes: jest.fn(),
}));

describe("JournalService", () => {
  let journalService: JournalService;
  let mockApp: jest.Mocked<App>;
  let settingsModel: SettingsModel;
  let mockVault: { read: jest.Mock; modify: jest.Mock };
  let sourceFile: TFile;
  const mockGetDailyNote = DailyNotesInterface.getDailyNote as jest.Mock;
  const mockCreateDailyNote = DailyNotesInterface.createDailyNote as jest.Mock;

  beforeEach(() => {
    mockVault = {
      read: jest.fn(),
      modify: jest.fn(),
    };
    mockApp = {
      vault: mockVault,
    } as unknown as jest.Mocked<App>;

    settingsModel = new SettingsModel({ defaultEntryText: "✅" }, jest.fn());

    journalService = new JournalService(mockApp, settingsModel);

    sourceFile = new TFile();
    sourceFile.basename = "SourceNote";

    // Mock window.moment
    (window as unknown as { moment: unknown }).moment = () => ({
      format: (fmt: string) => {
        if (fmt === "HH:mm") return "10:00";
        if (fmt === "YYYY-MM-DD") return "2023-01-01";
        return "";
      },
    });
  });

  describe("empty note handling", () => {
    test("uses defaultEntryText from settings when note is empty", async () => {
      settingsModel = new SettingsModel(
        { defaultEntryText: "Done!" },
        jest.fn(),
      );
      journalService = new JournalService(mockApp, settingsModel);
      mockGetDailyNote.mockReturnValue(new TFile());
      mockVault.read.mockResolvedValue("Existing content");

      await journalService.logEntry(sourceFile, "", "10:00");

      expect(mockVault.modify).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining("10:00 - Done!"),
      );
    });

    test("uses ✅ fallback when settings defaultEntryText is empty", async () => {
      settingsModel = new SettingsModel({ defaultEntryText: "" }, jest.fn());
      journalService = new JournalService(mockApp, settingsModel);
      mockGetDailyNote.mockReturnValue(new TFile());
      mockVault.read.mockResolvedValue("Existing content");

      await journalService.logEntry(sourceFile, "", "10:00");

      expect(mockVault.modify).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining("10:00 - ✅"),
      );
    });

    test("uses ✅ fallback when settings defaultEntryText is whitespace", async () => {
      settingsModel = new SettingsModel({ defaultEntryText: "   " }, jest.fn());
      journalService = new JournalService(mockApp, settingsModel);
      mockGetDailyNote.mockReturnValue(new TFile());
      mockVault.read.mockResolvedValue("Existing content");

      await journalService.logEntry(sourceFile, "   ", "10:00");

      expect(mockVault.modify).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining("10:00 - ✅"),
      );
    });
  });

  test("should log entry to new section if header missing", async () => {
    mockGetDailyNote.mockReturnValue(new TFile());
    mockVault.read.mockResolvedValue("Existing content");

    await journalService.logEntry(sourceFile, "Test entry", "10:00");

    expect(mockVault.modify).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining(
        "## Journal Log\n\n[[SourceNote]]\n10:00 - Test entry",
      ),
    );
  });

  test("should append new block if header exists but source not found", async () => {
    mockGetDailyNote.mockReturnValue(new TFile());
    mockVault.read.mockResolvedValue(
      "Existing content\n## Journal Log\n\n[[OtherNote]]\n10:00 - Other",
    );

    await journalService.logEntry(sourceFile, "Test entry", "10:00");

    expect(mockVault.modify).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining(
        "## Journal Log\n\n[[OtherNote]]\n10:00 - Other\n\n[[SourceNote]]\n10:00 - Test entry",
      ),
    );
  });

  test("should append to existing block", async () => {
    mockGetDailyNote.mockReturnValue(new TFile());
    mockVault.read.mockResolvedValue(
      "## Journal Log\n\n[[SourceNote]]\n09:00 - Previous",
    );

    await journalService.logEntry(sourceFile, "Test entry", "10:00");

    expect(mockVault.modify).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining(
        "[[SourceNote]]\n09:00 - Previous\n10:00 - Test entry",
      ),
    );
  });

  test("should call createDailyNote when explicitly called", async () => {
    const mockFile = new TFile();
    mockCreateDailyNote.mockResolvedValue(mockFile);

    const result = await journalService.createDailyNote();

    expect(mockCreateDailyNote).toHaveBeenCalled();
    expect(result).toBe(mockFile);
  });
});
