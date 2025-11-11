import { ref, onMounted, onUnmounted } from 'vue';

// 提醒提前时间选项（分钟）
export const reminderOptions = [
  { value: 0, label: '无提醒' },
  { value: 5, label: '提前5分钟' },
  { value: 15, label: '提前15分钟' },
  { value: 30, label: '提前30分钟' },
  { value: 60, label: '提前1小时' },
  { value: 1440, label: '提前1天' }
];

export function useNotification(todosRef) {
  // 提醒相关状态
  const notificationPermission = ref('default');
  let reminderCheckInterval = null;

  // 请求通知权限
  async function requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      notificationPermission.value = permission;
      return permission === 'granted';
    }
    return false;
  }

  // 发送通知
  function sendNotification(title, options) {
    if ('Notification' in window && notificationPermission.value === 'granted') {
      try {
        new Notification(title, options);
      } catch (error) {
        console.warn('通知发送失败:', error);
      }
    }
  }

  // 检查任务提醒
  function checkReminders() {
    const now = new Date();
    const todos = todosRef.value || [];
    
    todos.forEach(todo => {
      // 跳过已完成任务和无截止日期/无提醒的任务
      if (todo.completed || !todo.dueDate || !todo.reminder || todo.reminder === 0) {
        return;
      }
      
      const dueDate = new Date(todo.dueDate);
      const reminderTime = new Date(dueDate.getTime() - todo.reminder * 60 * 1000);
      
      // 检查是否到达提醒时间（允许1分钟的误差）
      const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
      if (timeDiff <= 60 * 1000 && !todo.notified) {
        sendNotification('任务提醒', {
          body: `${todo.title}\n截止时间: ${dueDate.toLocaleString()}`,
          icon: '/vite.svg',
          tag: `todo-reminder-${todo.id}`
        });
        // 标记已通知，避免重复提醒
        todo.notified = true;
      }
    });
  }

  // 组件挂载时初始化
  onMounted(async () => {
    // 请求通知权限
    await requestNotificationPermission();
    
    // 设置定时器，每分钟检查一次提醒
    reminderCheckInterval = setInterval(checkReminders, 60 * 1000);
    
    // 立即执行一次检查
    checkReminders();
  });

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (reminderCheckInterval) {
      clearInterval(reminderCheckInterval);
    }
  });

  return {
    notificationPermission,
    requestNotificationPermission,
    sendNotification,
    checkReminders
  };
}