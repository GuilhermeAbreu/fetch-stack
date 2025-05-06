export class FocusManager {
  private focused: boolean = true;
  private listeners: Set<(focused: boolean) => void> = new Set();
  private visibilityHandler: (() => void) | null = null;

  constructor() {
    this.setupVisibilityListener();
  }

  private setupVisibilityListener() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      this.visibilityHandler = () => {
        const isVisible = document.visibilityState === 'visible';
        this.setFocused(isVisible);
      };

      window.addEventListener('visibilitychange', this.visibilityHandler, false);
    }
  }

  public setFocused(focused: boolean | undefined) {
    if (focused === undefined) {
      this.focused = document.visibilityState === 'visible';
    } else {
      this.focused = focused;
    }

    this.listeners.forEach(listener => listener(this.focused));
  }

  public isFocused(): boolean {
    return this.focused;
  }

  public subscribe(listener: (focused: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public cleanup() {
    if (this.visibilityHandler && typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    this.listeners.clear();
  }
} 