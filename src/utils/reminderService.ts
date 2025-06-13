
export class ReminderService {
  private static instance: ReminderService;
  private notificationPermission: NotificationPermission = 'default';

  private constructor() {
    this.checkNotificationPermission();
  }

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  private async checkNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  public async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    }
    return false;
  }

  public canShowNotifications(): boolean {
    return 'Notification' in window && this.notificationPermission === 'granted';
  }

  public showReminderNotification(title: string, body: string): void {
    if (this.canShowNotifications()) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'mood-reminder',
        requireInteraction: false,
        silent: false
      });
    }
  }

  public scheduleEveningReminder(): void {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0); // 8 PM

    // If it's already past 8 PM today, schedule for tomorrow
    if (now.getTime() > reminderTime.getTime()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showReminderNotification(
        'Daily Mood Check-in',
        'How are you feeling today? Take a moment to log your mood.'
      );
      
      // Schedule the next reminder for tomorrow
      this.scheduleEveningReminder();
    }, timeUntilReminder);
  }

  public initialize(): void {
    // Request permission and schedule reminders
    this.requestPermission().then((granted) => {
      if (granted) {
        this.scheduleEveningReminder();
      }
    });
  }
}

// Export singleton instance
export const reminderService = ReminderService.getInstance();
