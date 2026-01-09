import { Notice } from "obsidian";

/**
 * Service for displaying notifications to the user.
 */
export class NotificationService {
  notice(message: string): void {
    new Notice(message);
  }
}
