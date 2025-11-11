<template>
  <div class="todo-details" :class="{ show: todo }">
    <div v-if="todo" class="details-content">
      <div class="details-header">
        <h2>任务详情</h2>
        <button @click="handleClose" class="btn-close" title="关闭">×</button>
      </div>

      <div class="detail-item">
        <h3 class="detail-title" :class="{ completed: todo.completed }">
          {{ todo.title }}
        </h3>
        <div class="detail-meta">
          <span class="todo-category" :class="`category-${todo.category}`">
            {{ todo.category }}
          </span>
          <span class="todo-priority" :class="`priority-${todo.priority}`">
            {{ todo.priority }}
          </span>
          <span v-if="todo.completed" class="todo-status completed">
            已完成
          </span>
          <span v-else class="todo-status pending">进行中</span>
          <span
            v-if="todo.dueDate && isOverdue(todo) && !todo.completed"
            class="todo-status overdue"
          >
            已过期
          </span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">描述：</div>
        <div class="detail-value">
          {{ todo.description || "无描述" }}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">截止日期：</div>
        <div class="detail-value">
          {{ todo.dueDate ? formatDate(todo.dueDate) : "未设置" }}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">提醒设置：</div>
        <div class="detail-value">
          {{ getReminderLabel(todo.reminder) }}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">创建时间：</div>
        <div class="detail-value">
          {{ formatCreateTime(todo.id) }}
        </div>
      </div>

      <div class="details-actions">
        <button
          @click="handleToggleCompleted"
          class="btn"
          :class="todo.completed ? 'btn-secondary' : 'btn-primary'"
        >
          {{ todo.completed ? "标记为未完成" : "标记为已完成" }}
        </button>
        <button @click="handleDelete" class="btn btn-danger">删除任务</button>
      </div>
    </div>
    <div v-else class="empty-details">
      <h3>选择一个任务查看详情</h3>
      <p>从左侧列表点击任务来查看详细信息</p>
    </div>
  </div>
</template>

<script>
import { reminderOptions } from "../hooks/useNotification";

export default {
  name: "TodoDetails",
  props: {
    todo: {
      type: Object,
      default: null,
    },
  },
  emits: ["close", "toggle", "delete"],
  setup(props, { emit }) {
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatCreateTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const isOverdue = (todo) => {
      if (!todo.dueDate || todo.completed) return false;
      const now = new Date();
      const dueDate = new Date(todo.dueDate);
      return now > dueDate;
    };

    const getReminderLabel = (reminderMinutes) => {
      const option = reminderOptions.find(
        (opt) => String(opt.value) === String(reminderMinutes)
      );
      return option ? option.label : "无提醒";
    };

    const handleClose = () => {
      emit("close");
    };

    const handleToggleCompleted = () => {
      if (props.todo) {
        emit("toggle", props.todo.id);
      }
    };

    const handleDelete = () => {
      if (props.todo) {
        if (confirm(`确定要删除任务"${props.todo.title}"吗？`)) {
          emit("delete", props.todo.id);
        }
      }
    };

    return {
      formatDate,
      formatCreateTime,
      getReminderLabel,
      isOverdue,
      handleClose,
      handleToggleCompleted,
      handleDelete,
    };
  },
};
</script>

<style scoped>
.todo-details {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.details-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.details-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #333;
}

.detail-item {
  margin-bottom: 25px;
}

.detail-title {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  color: #333;
  transition: color 0.2s;
}

.detail-title.completed {
  text-decoration: line-through;
  color: #888;
}

.detail-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.todo-category,
.todo-priority,
.todo-status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
}

.category-工作 {
  background-color: #e3f2fd;
  color: #1976d2;
}

.category-学习 {
  background-color: #e8f5e9;
  color: #388e3c;
}

.category-生活 {
  background-color: #fff8e1;
  color: #ffa000;
}

.priority-高 {
  background-color: #ffebee;
  color: #d32f2f;
}

.priority-中 {
  background-color: #fff3e0;
  color: #f57c00;
}

.priority-低 {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.todo-status.completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.todo-status.pending {
  background-color: #fff3e0;
  color: #f57c00;
}

.todo-status.overdue {
  background-color: #ffebee;
  color: #d32f2f;
}

.detail-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
}

.detail-label {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  font-size: 1rem;
}

.detail-value {
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

.details-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #2196f3;
  color: white;
}

.btn-secondary:hover {
  background-color: #1976d2;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.empty-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #888;
  padding: 40px 20px;
}

.empty-details h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 1.2rem;
}

.empty-details p {
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .todo-details {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
    display: none; /* 默认隐藏 */
  }
  
  .todo-details.show {
    display: block; /* 只有当选中任务时才显示 */
  }

  .detail-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .details-actions {
    flex-direction: column;
  }
}
</style>
