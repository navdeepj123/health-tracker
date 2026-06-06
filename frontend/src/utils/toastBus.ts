export interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

type Listener = (toasts: Toast[]) => void;

class ToastBus {
  private toasts: Toast[] = [];
  private listeners: Listener[] = [];
  private nextId = 1;

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener(this.toasts);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  private notify() { this.listeners.forEach((l) => l([...this.toasts])); }

  push(message: string, type: Toast['type'] = 'info') {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts = [...this.toasts, toast];
    this.notify();
    setTimeout(() => this.dismiss(toast.id), 4000);
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toastBus = new ToastBus();
