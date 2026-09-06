import { LifeOSService } from "./LifeOSService";

export class NotificationService {
  private static instance: NotificationService;
  private intervalId: number | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      alert("Este navegador no soporta notificaciones de escritorio.");
      return false;
    }

    if (Notification.permission === "granted") {
      this.startBackgroundChecks();
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.startBackgroundChecks();
        this.sendNotification("¡Notificaciones activadas!", "Tu Mentor IA te recordará tus misiones.");
        return true;
      }
    }
    
    return false;
  }

  private sendNotification(title: string, body: string) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: '/vite.svg', // Placeholder icon
      });
    }
  }

  public startBackgroundChecks() {
    if (this.intervalId) return;

    // Check every hour
    this.intervalId = window.setInterval(() => {
      this.checkHabits();
    }, 1000 * 60 * 60) as unknown as number;
  }

  private checkHabits() {
    const lifeService = LifeOSService.getInstance();
    const status = lifeService.getTodayStatus();
    const hour = new Date().getHours();

    // Water reminder (if less than 8 glasses and it's daytime)
    if (hour >= 9 && hour <= 20 && status.waterGlasses < 8) {
      this.sendNotification(
        "💧 ¡Hidrátate, Guerrero!", 
        `Llevas ${status.waterGlasses}/8 vasos de agua. ¡Recupera HP!`
      );
    }

    // Gym reminder (if evening and haven't trained)
    if (hour >= 17 && hour <= 21 && status.gymTrainedMuscles.length === 0) {
      this.sendNotification(
        "💪 ¡Misión Pendiente: Gimnasio!", 
        "Aún no has registrado tu entrenamiento de hoy. ¡Gana 50 XP!"
      );
    }
  }
}
