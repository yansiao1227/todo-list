<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

// 任务分类选项
const categories = ["工作", "学习", "生活"];

// 优先级选项
const priorities = ["低", "中", "高"];

// 排序选项
const sortOptions = [
  { value: "default", label: "默认排序" },
  { value: "priority", label: "按优先级" },
  { value: "dueDate", label: "按截止日期" },
  { value: "title", label: "按标题" },
];

// 提醒提前时间选项（分钟）
const reminderOptions = [
  { value: 0, label: "无提醒" },
  { value: 5, label: "提前5分钟" },
  { value: 15, label: "提前15分钟" },
  { value: 30, label: "提前30分钟" },
  { value: 60, label: "提前1小时" },
  { value: 1440, label: "提前1天" },
];

// 当前选中的分类和排序方式
const selectedCategory = ref("全部");
const sortBy = ref("default");

// 任务列表数据 - 使用localStorage初始化
const todos = ref([]);

// 新任务表单数据
const newTodoTitle = ref("");
const newTodoDescription = ref("");
const newTodoCategory = ref("工作");
const newTodoPriority = ref("中");
const newTodoDueDate = ref("");
const newTodoReminder = ref(0); // 默认无提醒

// 提醒相关状态
const notificationPermission = ref("default");
let reminderCheckInterval = null;

// 选中的任务，用于展示详情
const selectedTodo = ref(null);

// 从localStorage加载数据
function loadTodos() {
  const savedTodos = localStorage.getItem("todos");
  if (savedTodos) {
    todos.value = JSON.parse(savedTodos);
  } else {
    // 初始化一些示例数据
    todos.value = [
      {
        id: 1,
        title: "学习Vue3",
        description: "学习Vue3的基本语法和组合式API",
        category: "学习",
        priority: "高",
        dueDate: "",
        completed: false,
      },
      {
        id: 2,
        title: "创建TodoList应用",
        description: "使用Vue3实现一个完整的TodoList应用",
        category: "工作",
        priority: "中",
        dueDate: "",
        completed: true,
      },
      {
        id: 3,
        title: "添加新功能",
        description: "为TodoList添加标题和描述功能",
        category: "工作",
        priority: "中",
        dueDate: "",
        completed: false,
      },
    ];
  }
}

// 保存数据到localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos.value));
}

// 请求通知权限
async function requestNotificationPermission() {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    notificationPermission.value = permission;
    return permission === "granted";
  }
  return false;
}

// 发送通知
function sendNotification(title, options) {
  if ("Notification" in window && notificationPermission.value === "granted") {
    new Notification(title, options);
  }
}

// 检查任务提醒
function checkReminders() {
  const now = new Date();
  todos.value.forEach((todo) => {
    // 跳过已完成任务和无截止日期/无提醒的任务
    if (
      todo.completed ||
      !todo.dueDate ||
      !todo.reminder ||
      todo.reminder === 0
    ) {
      return;
    }

    const dueDate = new Date(todo.dueDate);
    const reminderTime = new Date(
      dueDate.getTime() - todo.reminder * 60 * 1000
    );

    // 检查是否到达提醒时间（允许1分钟的误差）
    const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
    if (timeDiff <= 60 * 1000 && !todo.notified) {
      sendNotification("任务提醒", {
        body: `${todo.title}\n截止时间: ${dueDate.toLocaleString()}`,
        icon: "/vite.svg",
        tag: `todo-reminder-${todo.id}`,
      });
      // 标记已通知，避免重复提醒
      todo.notified = true;
    }
  });
}

// 添加新任务
function addTodo() {
  if (newTodoTitle.value.trim() !== "") {
    todos.value.push({
      id: Date.now(),
      title: newTodoTitle.value.trim(),
      description: newTodoDescription.value.trim() || "无描述",
      category: newTodoCategory.value,
      priority: newTodoPriority.value,
      dueDate: newTodoDueDate.value || null,
      reminder: newTodoReminder.value || 0,
      notified: false,
      completed: false,
    });
    // 清空输入框
    newTodoTitle.value = "";
    newTodoDescription.value = "";
    newTodoDueDate.value = "";
    newTodoReminder.value = 0;
  }
}

// 显示任务详情
function showTodoDetails(todo) {
  selectedTodo.value = todo;
}

// 切换任务完成状态
function toggleTodo(id) {
  const todo = todos.value.find((todo) => todo.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
}

// 更新任务提醒设置
function updateTodoReminder(id, reminder) {
  const todo = todos.value.find((todo) => todo.id === id);
  if (todo) {
    todo.reminder = reminder;
    todo.notified = false; // 重置通知状态
  }
}

// 删除任务
function deleteTodo(id) {
  todos.value = todos.value.filter((todo) => todo.id !== id);
  if (selectedTodo.value && selectedTodo.value.id === id) {
    selectedTodo.value = null;
  }
}

// 清除已完成任务
function clearCompleted() {
  todos.value = todos.value.filter((todo) => !todo.completed);
  if (selectedTodo.value && selectedTodo.value.completed) {
    selectedTodo.value = null;
  }
}

// 计算过滤和排序后的任务列表
const filteredAndSortedTodos = computed(() => {
  let result = [...todos.value];

  // 按分类过滤
  if (selectedCategory.value !== "全部") {
    result = result.filter((todo) => todo.category === selectedCategory.value);
  }

  // 排序
  switch (sortBy.value) {
    case "priority":
      // 按优先级排序：高 > 中 > 低
      const priorityOrder = { 高: 0, 中: 1, 低: 2 };
      result.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      break;
    case "dueDate":
      // 按截止日期排序，无截止日期的排在最后
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      break;
    case "title":
      // 按标题字母顺序排序
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      // 默认按创建时间排序（ID排序）
      result.sort((a, b) => b.id - a.id);
  }

  return result;
});

// 计算未完成任务数量
const remainingCount = computed(() => {
  return todos.value.filter((todo) => !todo.completed).length;
});

// 监听todos变化，自动保存到localStorage
watch(todos, saveTodos, { deep: true });

// 组件挂载时初始化
onMounted(async () => {
  loadTodos();

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
</script>

<template>
  <div class="todo-app">
    <h1>Todo List</h1>

    <!-- 添加任务表单 -->
    <div class="add-todo">
      <div class="todo-form">
        <input
          v-model="newTodoTitle"
          @keyup.enter="addTodo"
          placeholder="请输入任务标题..."
          class="todo-title-input"
        />
        <textarea
          v-model="newTodoDescription"
          placeholder="请输入任务描述（可选）..."
          class="todo-description-input"
          rows="2"
        ></textarea>
        <div class="todo-form-row">
          <select v-model="newTodoCategory" class="todo-select">
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <select v-model="newTodoPriority" class="todo-select">
            <option
              v-for="priority in priorities"
              :key="priority"
              :value="priority"
            >
              优先级：{{ priority }}
            </option>
          </select>
          <input
            type="date"
            v-model="newTodoDueDate"
            class="todo-date-input"
            placeholder="截止日期"
          />
        </div>
        <div class="todo-form-row">
          <select v-model="newTodoReminder" class="todo-select reminder-select">
            <option
              v-for="option in reminderOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <button
            v-if="notificationPermission !== 'granted'"
            @click="requestNotificationPermission"
            class="permission-button"
          >
            {{
              notificationPermission === "denied"
                ? "通知权限被拒绝"
                : "允许通知"
            }}
          </button>
          <span v-else class="permission-granted">通知权限已授予</span>
        </div>
        <button @click="addTodo" class="add-button">添加任务</button>
      </div>
    </div>

    <!-- 筛选和排序工具栏 -->
    <div class="todo-toolbar">
      <div class="filter-section">
        <span class="filter-label">分类：</span>
        <button
          v-for="cat in ['全部', ...categories]"
          :key="cat"
          :class="['filter-button', { active: selectedCategory === cat }]"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      <div class="sort-section">
        <span class="sort-label">排序：</span>
        <select v-model="sortBy" class="sort-select">
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- 任务列表和详情 -->
    <div class="todo-content">
      <div class="todo-list-section">
        <h2>任务列表</h2>
        <ul class="todo-list">
          <li
            v-for="todo in filteredAndSortedTodos"
            :key="todo.id"
            :class="['todo-item', { completed: todo.completed }]"
            @click="showTodoDetails(todo)"
          >
            <input
              type="checkbox"
              :checked="todo.completed"
              @change.stop="toggleTodo(todo.id)"
              class="todo-checkbox"
            />
            <div class="todo-info">
              <h3 class="todo-title">{{ todo.title }}</h3>
              <p class="todo-description-preview">
                {{
                  todo.description.length > 30
                    ? todo.description.substring(0, 30) + "..."
                    : todo.description
                }}
              </p>
              <div class="todo-meta">
                <span
                  :class="['category-badge', `category-${todo.category}`]"
                  >{{ todo.category }}</span
                >
                <span
                  :class="['priority-badge', `priority-${todo.priority}`]"
                  >{{ todo.priority }}</span
                >
                <span v-if="todo.dueDate" class="due-date"
                  >截止: {{ new Date(todo.dueDate).toLocaleDateString() }}</span
                >
                <span
                  v-if="todo.reminder && todo.reminder > 0"
                  class="reminder-badge"
                  >有提醒</span
                >
              </div>
            </div>
            <button @click.stop="deleteTodo(todo.id)" class="delete-button">
              删除
            </button>
          </li>
        </ul>
        <div v-if="filteredAndSortedTodos.length === 0" class="empty-message">
          暂无任务
        </div>
      </div>

      <!-- 任务详情 -->
      <div class="todo-details-section" v-if="selectedTodo">
        <h2>任务详情</h2>
        <div class="todo-details">
          <div class="detail-item">
            <label>状态：</label>
            <input
              type="checkbox"
              :checked="selectedTodo.completed"
              @change="toggleTodo(selectedTodo.id)"
            />
            <span>{{ selectedTodo.completed ? "已完成" : "未完成" }}</span>
          </div>
          <div class="detail-item">
            <label>标题：</label>
            <h3>{{ selectedTodo.title }}</h3>
          </div>
          <div class="detail-item">
            <label>描述：</label>
            <p>{{ selectedTodo.description }}</p>
          </div>
          <div class="detail-item">
            <label>分类：</label>
            <span
              :class="['category-badge', `category-${selectedTodo.category}`]"
              >{{ selectedTodo.category }}</span
            >
          </div>
          <div class="detail-item">
            <label>优先级：</label>
            <span
              :class="['priority-badge', `priority-${selectedTodo.priority}`]"
              >{{ selectedTodo.priority }}</span
            >
          </div>
          <div class="detail-item">
            <label>截止日期：</label>
            <span>{{
              selectedTodo.dueDate
                ? new Date(selectedTodo.dueDate).toLocaleDateString()
                : "无截止日期"
            }}</span>
          </div>
          <div class="detail-item">
            <label>提醒设置：</label>
            <select
              v-model="selectedTodo.reminder"
              class="todo-select detail-select"
              @change="
                updateTodoReminder(selectedTodo.id, selectedTodo.reminder)
              "
            >
              <option
                v-for="option in reminderOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span v-if="selectedTodo.notified" class="notified-badge"
              >已通知</span
            >
          </div>
        </div>
        <button @click="selectedTodo = null" class="close-button">
          关闭详情
        </button>
      </div>
    </div>

    <!-- 统计信息和操作 -->
    <div class="todo-footer">
      <span class="todo-count">{{ remainingCount }} 个未完成任务</span>
      <button @click="clearCompleted" class="clear-button">
        清除已完成任务
      </button>
    </div>
  </div>
</template>

<style scoped>
.todo-app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-app h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.add-todo {
  margin-bottom: 30px;
}

.todo-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-form-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.todo-title-input {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.todo-description-input {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.todo-select {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  background: white;
  cursor: pointer;
}

.reminder-select {
  flex: 1;
}

.detail-select {
  margin-top: 5px;
  width: 100%;
}

.todo-date-input {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.add-button {
  padding: 12px 20px;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  align-self: flex-start;
  transition: background-color 0.2s;
}

.permission-button {
  padding: 10px 15px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.permission-button:hover {
  background-color: #f57c00;
}

.permission-granted {
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  font-size: 14px;
}

.add-button:hover {
  background-color: #535bf2;
}

/* 工具栏样式 */
.todo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-section,
.sort-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label,
.sort-label {
  font-weight: 600;
  color: #666;
}

.filter-button {
  padding: 8px 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-button:hover {
  background: #f0f0f0;
}

.filter-button.active {
  background: #646cff;
  color: white;
  border-color: #646cff;
}

.sort-select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

/* 主要内容区域 */
.todo-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.todo-list-section,
.todo-details-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.todo-list-section h2,
.todo-details-section h2 {
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  margin-bottom: 10px;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
}

.todo-item:hover {
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todo-item.completed .todo-title,
.todo-item.completed .todo-description-preview,
.todo-item.completed .todo-meta {
  text-decoration: line-through;
  color: #888;
}

.todo-checkbox {
  margin-right: 15px;
  margin-top: 2px;
  width: 18px;
  height: 18px;
}

.todo-info {
  flex: 1;
}

.todo-title {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}

.todo-description-preview {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 任务元信息 */
.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.category-badge,
.priority-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 分类样式 */
.category-工作 {
  background: #e3f2fd;
  color: #1976d2;
}

.category-学习 {
  background: #e8f5e9;
  color: #388e3c;
}

.category-生活 {
  background: #fff3e0;
  color: #f57c00;
}

/* 优先级样式 */
.priority-高 {
  background: #ffebee;
  color: #d32f2f;
}

.priority-中 {
  background: #fffde7;
  color: #fbc02d;
}

.priority-低 {
  background: #f3e5f5;
  color: #7b1fa2;
}

.due-date {
  font-size: 12px;
  color: #666;
}

.reminder-badge {
  background-color: #e0f7fa;
  color: #006064;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.notified-badge {
  margin-left: 10px;
  background-color: #ffebee;
  color: #c62828;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 空状态提示 */
.empty-message {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 16px;
}

.delete-button {
  padding: 5px 10px;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #ff3838;
}

/* 任务详情样式 */
.todo-details {
  background: white;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item label {
  display: block;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-item h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.detail-item p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.detail-item span {
  display: inline-block;
}

.close-button {
  padding: 10px 20px;
  background-color: #f1f2f6;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #e0e0e0;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .todo-content {
    grid-template-columns: 1fr;
  }

  .todo-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .todo-form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .todo-select,
  .todo-date-input,
  .permission-button,
  .permission-granted {
    width: 100%;
  }
}

.todo-count {
  color: #666;
}

.clear-button {
  padding: 8px 12px;
  background-color: #f1f2f6;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-button:hover {
  background-color: #e0e0e0;
}
</style>

