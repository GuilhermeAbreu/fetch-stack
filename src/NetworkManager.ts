export class NetworkManager {
  private online: boolean = true;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    this.online = typeof navigator !== "undefined" ? navigator.onLine : true;
    this.setupListeners();
  }

  private setupListeners(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.setOnline(true));
      window.addEventListener("offline", () => this.setOnline(false));
    }
  }

  private setOnline(online: boolean): void {
    this.online = online;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.online));
  }

  isOnline(): boolean {
    return this.online;
  }

  subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  mockOffline(): void {
    this.setOnline(false);
  }

  mockOnline(): void {
    this.setOnline(true);
  }
}
