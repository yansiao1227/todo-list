<template>
  <div class="todo-item" @click="handleShowDetails">
    <div class="todo-header">
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="handleToggle"
        class="todo-checkbox"
      />
      <div class="todo-title-container">
        <h3 class="todo-title" :class="{ completed: todo.completed }">
          {{ todo.title }}
        </h3>
        <div class="todo-meta">
          <span class="todo-category" :class="`category-${todo.category}`">
            {{ todo.category }}
          </span>
          <span class="todo-priority" :class="`priority-${todo.priority}`">
            {{ todo.priority }}
          </span>
          <span v-if="todo.dueDate" class="todo-due-date" :class="{ 'overdue': isOverdue(todo) && !todo.completed }">
            📅 {{ formatDate(todo.dueDate) }}
            <span v-if="isOverdue(todo) && !todo.completed" class="overdue-badge">已过期</span>
          </span>
          <span v-if="todo.reminder && todo.reminder > 0" class="todo-reminder">
            ⏰ 有提醒
          </span>
        </div>
      </div>
      <button @click="handleDelete" class="btn-delete" title="删除任务">
        删除
      </button>
    </div>
    <div v-if="showDescription" class="todo-description">
      {{ todo.description }}
    </div>
  </div>
</template>

<script>
export default {
  name: "TodoItem",
  props: {
    todo: {
      type: Object,
      required: true,
    },
  },
  emits: ["toggle", "delete", "show-details"],
  setup(props, { emit }) {
    const showDescription = false;

    const handleToggle = () => {
      emit("toggle", props.todo.id);
    };

    const handleDelete = () => {
      if (confirm(`确定要删除任务"${props.todo.title}"吗？`)) {
        emit("delete", props.todo.id);
      }
    };

    const handleShowDetails = () => {
      emit("show-details", props.todo);
    };

    const isOverdue = (todo) => {
      if (!todo.dueDate || todo.completed) return false;
      const now = new Date();
      const dueDate = new Date(todo.dueDate);
      return now > dueDate;
    };

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

    return {
      showDescription,
      handleToggle,
      handleDelete,
      handleShowDetails,
      isOverdue,
      formatDate,
    };
  },
};
</script>

<style scoped>
.todo-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.todo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.todo-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.todo-checkbox {
  margin-top: 4px;
  transform: scale(1.2);
}

.todo-title-container {
  flex: 1;
  cursor: pointer;
}

.todo-title {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #333;
  transition: color 0.2s;
}

.todo-title.completed {
  text-decoration: line-through;
  color: #888;
}

.todo-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.todo-category,
.todo-priority {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
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

.todo-due-date,
.todo-reminder {
  font-size: 0.8rem;
  color: #666;
  font-size: 0.9rem;
}

.todo-due-date.overdue {
  color: #d32f2f;
}

.overdue-badge {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 5px;
}

.todo-reminder {
  font-size: 0.8rem;
  color: #666;
}

.todo-description {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  color: #555;
  font-size: 0.9rem;
}

.btn-delete {
  padding: 4px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-delete:hover {
  background: #d32f2f;
}

@media (max-width: 768px) {
  .todo-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
