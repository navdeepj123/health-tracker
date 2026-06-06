import webpush from 'web-push';
import { Observer, DomainEvent } from './EventBus';
import { getSubscriptionsForUser } from '../../services/PushSubscriptionStore';
import EventBus from './EventBus';
import foodRepository from '../../repositories/FoodRepository';
import waterRepository from '../../repositories/WaterRepository';
import UserRepository from '../../repositories/UserRepository';

// Sends a push notification to all browsers subscribed by this user
const sendPush = async (userId: string, title: string, body: string): Promise<void> => {
  const subs = await getSubscriptionsForUser(userId);
  if (!subs.length) return;
  const payload = JSON.stringify({ title, body });
  await Promise.all(subs.map((s) => webpush.sendNotification(s, payload).catch(() => {})));
};

// Tracks which goals were already notified today to avoid repeated notifications
// Format: "userId-goalType-YYYY-MM-DD"
const notifiedToday = new Set<string>();
const todayKey = (userId: string, type: string): string =>
  `${userId}-${type}-${new Date().toISOString().split('T')[0]}`;

// Notifies the user every time they log a workout, meal, or water entry
export class PushNotificationObserver implements Observer {
  async update(event: DomainEvent, payload: any): Promise<void> {
    const messages: Record<string, string> = {
      'workout.created': `Great session! "${payload?.title}" logged 🏋️`,
      'food.created': `"${payload?.name}" added to your food diary 🍽️`,
      'water.created': `+${payload?.amount}ml logged — stay hydrated! 💧`,
    };
    const body = messages[event];
    if (!body || !payload?.user) return;
    await sendPush(payload.user.toString(), 'Health Tracker', body);
  }
}

// After each food or water log, checks if the user has hit their daily goal
// and fires a goal event if so — only once per day per goal type
export class GoalCheckObserver implements Observer {
  async update(event: DomainEvent, payload: any): Promise<void> {
    if (!payload?.user) return;
    const userId = payload.user.toString();
    if (event === 'food.created') await this.checkCalorieGoal(userId);
    if (event === 'water.created') await this.checkWaterGoal(userId);
  }

  private async checkCalorieGoal(userId: string): Promise<void> {
    const key = todayKey(userId, 'calories');
    if (notifiedToday.has(key)) return;
    const user = await UserRepository.findById(userId);
    if (!user) return;
    const total = await foodRepository.getTotalCaloriesToday(userId);
    if (total >= (user.dailyCalorieGoal || 2000)) {
      notifiedToday.add(key);
      EventBus.publish('goal.calories.reached', {
        userId,
        total,
        goal: user.dailyCalorieGoal || 2000,
      });
    }
  }

  private async checkWaterGoal(userId: string): Promise<void> {
    const key = todayKey(userId, 'water');
    if (notifiedToday.has(key)) return;
    const user = await UserRepository.findById(userId);
    if (!user) return;
    const total = await waterRepository.getTotalAmountToday(userId);
    if (total >= (user.dailyWaterGoal || 2000)) {
      notifiedToday.add(key);
      EventBus.publish('goal.water.reached', {
        userId,
        total,
        goal: user.dailyWaterGoal || 2000,
      });
    }
  }
}

// Sends a congratulations notification when a daily goal is reached
export class GoalReachedObserver implements Observer {
  async update(event: DomainEvent, payload: any): Promise<void> {
    const { userId, goal, total } = payload || {};
    if (!userId) return;
    if (event === 'goal.calories.reached') {
      await sendPush(
        userId,
        '🎉 Daily Calorie Goal Reached!',
        `You have hit your ${goal} kcal goal for today. Well done!`
      );
    }
    if (event === 'goal.water.reached') {
      await sendPush(
        userId,
        '💧 Hydration Goal Complete!',
        `${total}ml logged today — you have hit your daily water goal!`
      );
    }
  }
}

// Writes an audit log line for every domain event
export class AuditLogObserver implements Observer {
  update(event: DomainEvent, payload: any): void {
    const user = payload?.user?.toString() || payload?.userId || 'unknown';
    console.log(`[AUDIT] ${new Date().toISOString()} | ${event} | user=${user}`);
  }
}
