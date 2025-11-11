<template>
  <div class="todo-form">
    <h2>添加新任务</h2>
    <div class="form-group">
      <input
        :value="newForm.title"
        @input="setFieldValue('title', $event.target.value)"
        type="text"
        placeholder="任务标题"
        class="form-input"
      />
    </div>
    <div class="form-group">
      <textarea
        :value="newForm.description"
        @input="setFieldValue('description', $event.target.value)"
        placeholder="任务描述（可选）"
        class="form-textarea"
        rows="3"
      ></textarea>
    </div>
    <div class="form-row">
      <div class="form-group form-half">
        <label>分类：</label>
        <select
          :value="newForm.category"
          @input="setFieldValue('category', $event.target.value)"
          class="form-select"
        >
          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>
      <div class="form-group form-half">
        <label>优先级：</label>
        <select
          :value="newForm.priority"
          @input="setFieldValue('priority', $event.target.value)"
          class="form-select"
        >
          <option
            v-for="priority in priorities"
            :key="priority"
            :value="priority"
          >
            {{ priority }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group form-half">
        <label>截止日期：</label>
        <input
          :value="newForm.dueDate"
          @input="setFieldValue('dueDate', $event.target.value)"
          type="datetime-local"
          class="form-input"
        />
      </div>
      <div class="form-group form-half">
        <label>提醒：</label>
        <select
          :value="newForm.reminder"
          @input="setFieldValue('reminder', $event.target.value)"
          class="form-select"
        >
          <option
            v-for="option in reminderOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-actions">
      <button
        @click="handleAddTodo"
        class="btn btn-primary"
        :disabled="isDisabled"
      >
        添加任务
      </button>
      <button @click="resetForm" class="btn btn-secondary">重置</button>
      <button
        v-if="notificationPermission !== 'granted'"
        @click="requestNotificationPermission"
        class="btn btn-notification"
      >
        {{ notificationPermission === "default" ? "请求通知权限" : "允许通知" }}
      </button>
    </div>
  </div>
</template>

<script>
import { categories, priorities } from "../hooks/useTodoManager";
import { reminderOptions } from "../hooks/useNotification";
import { computed } from "vue";

export default {
  name: "TodoForm",
  props: {
    newForm: {
      type: Object,
      required: true,
    },
    notificationPermission: {
      type: String,
      default: "default",
    },
  },
  emits: ["add-todo", "reset-form", "request-permission", "set-field-value"],
  setup(props, { emit }) {
    const isDisabled = computed(() => {
      return !props.newForm.title.trim();
    });

    const setFieldValue = (field, value) => {
      emit("set-field-value", field, value);
    };

    const handleAddTodo = () => {
      emit("add-todo");
    };

    const resetForm = () => {
      emit("reset-form");
    };

    const requestNotificationPermission = () => {
      emit("request-permission");
    };

    return {
      isDisabled,
      categories,
      priorities,
      reminderOptions,
      setFieldValue,
      handleAddTodo,
      resetForm,
      requestNotificationPermission,
    };
  },
};
</script>

<style scoped>
.todo-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

h2 {
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-half {
  flex: 1;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #4caf50;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

label {
  text-align: right;
  font-weight: 500;
  width: 100px;
  color: #555;
}

.form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s, transform 0.1s;
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

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-notification {
  background-color: #2196f3;
  color: white;
  margin-left: auto;
}

.btn-notification:hover {
  background-color: #1976d2;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0px;
  }
  label {
    width: 120px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-notification {
    margin-left: 0;
  }
}
</style>
