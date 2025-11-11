import { ref, computed, watch, onMounted } from "vue";

// 任务分类选项
export const categories = ["工作", "学习", "生活"];

// 优先级选项
export const priorities = ["低", "中", "高"];

// 排序选项
export const sortOptions = [
  { value: "default", label: "默认排序" },
  { value: "priority", label: "按优先级" },
  { value: "dueDate", label: "按截止日期" },
  { value: "title", label: "按标题" },
];

export function useTodoManager() {
  // 当前选中的分类和排序方式
  const selectedCategory = ref("全部");
  const sortBy = ref("default");

  // 任务列表数据 - 使用localStorage初始化
  const todos = ref([]);

  // 新任务表单数据
  const newForm = ref({
    title: "",
    description: "",
    category: "工作",
    priority: "中",
    dueDate: "",
    reminder: 0 // 默认无提醒
  });
  
  const setFieldValue = (field, value) => {
    if (newForm.value.hasOwnProperty(field)) {
      newForm.value[field] = value;
    }
  };

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
          reminder: 0,
          notified: false,
        },
        {
          id: 2,
          title: "创建TodoList应用",
          description: "使用Vue3实现一个完整的TodoList应用",
          category: "工作",
          priority: "中",
          dueDate: "",
          completed: true,
          reminder: 0,
          notified: false,
        },
        {
          id: 3,
          title: "添加新功能",
          description: "为TodoList添加标题和描述功能",
          category: "工作",
          priority: "中",
          dueDate: "",
          completed: false,
          reminder: 0,
          notified: false,
        },
      ];
    }
  }

  // 保存数据到localStorage
  function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos.value));
  }

  // 添加新任务
  function addTodo() {
    if (newForm.value.title.trim() !== "") {
      todos.value.push({
        id: Date.now(),
        title: newForm.value.title.trim(),
        description: newForm.value.description.trim() || "无描述",
        category: newForm.value.category,
        priority: newForm.value.priority,
        dueDate: newForm.value.dueDate || null,
        reminder: newForm.value.reminder || 0,
        notified: false,
        completed: false,
      });
      // 清空输入框
      resetForm();
    }
  }

  // 重置表单
  function resetForm() {
    newForm.value.title = "";
    newForm.value.description = "";
    newForm.value.dueDate = "";
    newForm.value.reminder = 0;
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
      // 当任务标记为已完成时，设置notified为true，防止已完成任务触发提醒
      if (todo.completed) {
        todo.notified = true;
      }
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
      result = result.filter(
        (todo) => todo.category === selectedCategory.value
      );
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

  // 组件挂载时加载数据
  onMounted(loadTodos);

  return {
    todos,
    selectedCategory,
    sortBy,
    newForm,
    selectedTodo,
    filteredAndSortedTodos,
    remainingCount,
    setFieldValue,
    addTodo,
    resetForm,
    showTodoDetails,
    toggleTodo,
    updateTodoReminder,
    deleteTodo,
    clearCompleted,
  };
}
