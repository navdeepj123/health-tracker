import EventBus from './EventBus';
import {
  PushNotificationObserver,
  GoalCheckObserver,
  GoalReachedObserver,
  AuditLogObserver,
} from './observers';

// Wire up all observers at server startup.
// Adding a new reaction to any event means one line here — nothing else changes.
export const registerObservers = (): void => {
  const push = new PushNotificationObserver();
  const goalCheck = new GoalCheckObserver();
  const goalReached = new GoalReachedObserver();
  const audit = new AuditLogObserver();

  // Every activity log triggers a push notification
  EventBus.subscribe('workout.created', push);
  EventBus.subscribe('food.created', push);
  EventBus.subscribe('water.created', push);

  // After food/water logs, check if a daily goal has been crossed
  EventBus.subscribe('food.created', goalCheck);
  EventBus.subscribe('water.created', goalCheck);

  // When a goal is reached, fire the congratulations notification
  EventBus.subscribe('goal.calories.reached', goalReached);
  EventBus.subscribe('goal.water.reached', goalReached);

  // Audit log for every event
  EventBus.subscribe('workout.created', audit);
  EventBus.subscribe('food.created', audit);
  EventBus.subscribe('water.created', audit);
  EventBus.subscribe('user.registered', audit);
  EventBus.subscribe('goal.calories.reached', audit);
  EventBus.subscribe('goal.water.reached', audit);

  console.log('[EventBus] Observers registered');
};
