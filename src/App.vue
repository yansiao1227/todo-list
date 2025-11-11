<script setup>
import { ref } from "vue";
import TodoForm from "./components/TodoForm.vue";
import TodoList from "./components/TodoList.vue";
import TodoDetails from "./components/TodoDetails.vue";
import { useTodoManager } from "./hooks/useTodoManager.js";
import { useNotification } from "./hooks/useNotification.js";

// 使用任务管理hook
const {
  todos,
  selectedCategory,
  sortBy,
  newForm,
  selectedTodo,
  filteredAndSortedTodos,
  remainingCount,
  addTodo,
  setFieldValue,
  showTodoDetails,
  toggleTodo,
  deleteTodo,
  clearCompleted,
} = useTodoManager();

// 使用通知管理hook
const { notificationPermission, requestNotificationPermission } =
  useNotification(ref(todos));
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Todo List</h1>
    </header>
    <main>
      <!-- 添加任务表单 -->
      <TodoForm
        :newForm="newForm"
        :notificationPermission="notificationPermission"
        @add-todo="addTodo"
        @set-field-value="setFieldValue"
        @request-permission="requestNotificationPermission"
      />
      <div class="main-content">
        <!-- 任务列表 -->
        <TodoList
          :todos="todos"
          :selectedCategory="selectedCategory"
          :sortBy="sortBy"
          :remainingCount="remainingCount"
          :filteredAndSortedTodos="filteredAndSortedTodos"
          @toggle="toggleTodo"
          @delete="deleteTodo"
          @show-details="showTodoDetails"
          @category-change="selectedCategory = $event"
          @sort-change="sortBy = $event"
          @clear-completed="clearCompleted"
        />
        <!-- 任务详情 -->
        <TodoDetails
          :todo="selectedTodo"
          @close="selectedTodo = null"
          @toggle="toggleTodo"
          @delete="deleteTodo"
        />
      </div>
    </main>
  </div>
</template>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  color: #333;
  margin: 0;
  font-size: 2.5rem;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .app-container {
    padding: 10px;
  }

  header h1 {
    font-size: 2rem;
  }
}
</style>
