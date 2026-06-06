// Observer Pattern — hand-written, not using Node's built-in EventEmitter.
// The Subject (EventBus) holds a list of Observers per event type.
// When a domain event fires, all subscribed observers are notified.
// This means services can stay unaware of side-effects like push notifications.

export type DomainEvent =
  | 'workout.created'
  | 'food.created'
  | 'water.created'
  | 'user.registered'
  | 'goal.calories.reached'
  | 'goal.water.reached';

export interface Observer {
  update(event: DomainEvent, payload: any): void | Promise<void>;
}

class EventBus {
  private static instance: EventBus;
  private observers: Map<DomainEvent, Observer[]> = new Map();

  private constructor() {}

  // Singleton — one shared bus across the whole app
  public static getInstance(): EventBus {
    if (!EventBus.instance) EventBus.instance = new EventBus();
    return EventBus.instance;
  }

  public subscribe(event: DomainEvent, observer: Observer): void {
    const list = this.observers.get(event) || [];
    list.push(observer);
    this.observers.set(event, list);
  }

  public publish(event: DomainEvent, payload: any): void {
    const list = this.observers.get(event) || [];
    for (const observer of list) {
      // Fire-and-forget so a slow observer never blocks the HTTP response
      Promise.resolve(observer.update(event, payload)).catch((err) =>
        console.error(`[EventBus] Observer error for "${event}":`, err.message)
      );
    }
  }
}

export default EventBus.getInstance();
