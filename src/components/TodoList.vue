<template>
  <div class="todo-list">
    <div class="list-header">
      <h2>任务列表</h2>
      <div class="list-stats">
        <span>剩余 {{ remainingCount }} 项任务</span>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label>分类筛选：</label>
        <div class="filter-options">
          <button
            v-for="category in ['全部', ...categories]"
            :key="category"
            @click="handleCategoryChange(category)"
            class="filter-btn"
            :class="{ active: selectedCategory === category }"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label>排序方式：</label>
        <select :value="sortBy" @input="handleSortChange" class="sort-select">
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-actions">
        <button
          @click="handleClearCompleted"
          class="btn-clear"
          v-if="todos.length > remainingCount"
        >
          清除已完成
        </button>
      </div>
    </div>

    <div class="todo-items">
      <template v-if="filteredAndSortedTodos.length > 0">
        <TodoItem
          v-for="todo in filteredAndSortedTodos"
          :key="todo.id"
          :todo="todo"
          @toggle="handleToggle"
          @delete="handleDelete"
          @show-details="handleShowDetails"
        />
      </template>
      <div v-else class="empty-state">
        <p>{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import TodoItem from "./TodoItem.vue";
import { categories, sortOptions } from "../hooks/useTodoManager";

export default {
  name: "TodoList",
  components: {
    TodoItem,
  },
  props: {
    todos: {
      type: Array,
      required: true,
    },
    selectedCategory: {
      type: String,
      required: true,
    },
    sortBy: {
      type: String,
      required: true,
    },
    remainingCount: {
      type: Number,
      required: true,
    },
    filteredAndSortedTodos: {
      type: Array,
      required: true,
    },
  },
  emits: [
    "toggle",
    "delete",
    "show-details",
    "category-change",
    "sort-change",
    "clear-completed",
  ],
  setup(props, { emit }) {
    const emptyMessage = computed(() => {
      if (props.selectedCategory !== "全部") {
        return `没有"${props.selectedCategory}"分类的任务`;
      }
      return props.todos.length === 0
        ? "暂无任务，添加一个吧！"
        : "没有符合条件的任务";
    });

    const handleToggle = (id) => {
      emit("toggle", id);
    };

    const handleDelete = (id) => {
      emit("delete", id);
    };

    const handleShowDetails = (todo) => {
      emit("show-details", todo);
    };

    const handleCategoryChange = (category) => {
      emit("category-change", category);
    };

    const handleSortChange = (event) => {
      emit("sort-change", event.target.value);
    };

    const handleClearCompleted = () => {
      if (confirm("确定要清除所有已完成的任务吗？")) {
        emit("clear-completed");
      }
    };

    return {
      categories,
      sortOptions,
      emptyMessage,
      handleToggle,
      handleDelete,
      handleShowDetails,
      handleCategoryChange,
      handleSortChange,
      handleClearCompleted,
    };
  },
};
</script>

<style scoped>
.todo-list {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  color: #333;
  margin: 0;
  font-size: 1.5rem;
}

.list-stats {
  color: #666;
  font-size: 0.9rem;
  background: #f5f5f5;
  padding: 5px 10px;
  border-radius: 15px;
}

.filter-bar {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 10px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: inline-block;
  margin-right: 10px;
  font-weight: 500;
  color: #555;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.filter-btn.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.sort-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background: #fff;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-clear {
  padding: 6px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-clear:hover {
  background: #d32f2f;
}

.todo-items {
  max-height: 600px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .filter-bar {
    padding: 10px;
  }

  .filter-options {
    flex-direction: column;
    gap: 5px;
  }

  .filter-btn {
    width: 100%;
  }

  .filter-actions {
    justify-content: center;
  }
}
</style>
