import { useEffect, useState } from "react";

const categories = [
  "College",
  "Personal",
  "Projects",
  "Fitness",
  "Other",
];

const priorities = ["High", "Medium", "Low"];

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("dailyTasks");

    if (!savedTasks) return [];

    try {
      return JSON.parse(savedTasks).map((task) => ({
        ...task,
        category: task.category || "Other",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || "",
      }));
    } catch {
      return [];
    }
  });

  const [taskInput, setTaskInput] = useState("");
  const [category, setCategory] = useState("College");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Save tasks
  useEffect(() => {
    localStorage.setItem("dailyTasks", JSON.stringify(tasks));
  }, [tasks]);

  // Reset form
  const resetForm = () => {
    setTaskInput("");
    setCategory("College");
    setPriority("Medium");
    setDueDate("");
    setEditingId(null);
  };

  // Add task
  const addTask = () => {
    const trimmedTask = taskInput.trim();

    if (!trimmedTask) {
      alert("Please enter a task.");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    const newTask = {
      id: Date.now(),
      text: trimmedTask,
      category,
      priority,
      dueDate,
      completed: false,
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);

    resetForm();
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );
  };

  // Complete task
  const toggleTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  // Start editing
  const startEditing = (task) => {
    setEditingId(task.id);
    setTaskInput(task.text);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate);
  };

  // Save edited task
  const saveEdit = () => {
    const trimmedTask = taskInput.trim();

    if (!trimmedTask) {
      alert("Task cannot be empty.");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === editingId
          ? {
              ...task,
              text: trimmedTask,
              category,
              priority,
              dueDate,
            }
          : task
      )
    );

    resetForm();
  };

  // Add or edit
  const handleSubmit = () => {
    if (editingId !== null) {
      saveEdit();
    } else {
      addTask();
    }
  };

  // Search + filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesStatus =
      filter === "all" ||
      (filter === "active" && !task.completed) ||
      (filter === "completed" && task.completed);

    const matchesCategory =
      categoryFilter === "all" ||
      task.category === categoryFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      task.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesPriority
    );
  });

  // Statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const activeTasks = totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // Date formatting
  const formatDate = (date) => {
    if (!date) return "No date";

    const dateObject = new Date(`${date}T00:00:00`);

    return dateObject.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Check overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(`${task.dueDate}T00:00:00`);

    return taskDate < today;
  };

  return (
    <div className="app-container">
      <main className="app">

        {/* HEADER */}
        <header className="header">
          <p className="eyebrow">
            PERSONAL PRODUCTIVITY
          </p>

          <h1>Daily Task Manager</h1>

          <p className="subtitle">
            Organize your day. Complete your goals.
          </p>

          <div className="header-line"></div>
        </header>

        {/* STATISTICS */}
        <section className="stats">

          <div className="stat-card">
            <span className="stat-number">
              {totalTasks}
            </span>

            <span className="stat-label">
              Total Tasks
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {activeTasks}
            </span>

            <span className="stat-label">
              Active
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {completedTasks}
            </span>

            <span className="stat-label">
              Completed
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {progress}%
            </span>

            <span className="stat-label">
              Progress
            </span>
          </div>

        </section>

        {/* PROGRESS */}
        <section className="progress-panel">

          <div className="progress-header">
            <div>
              <span className="small-label">
                DAILY PROGRESS
              </span>

              <h2>
                {completedTasks} of {totalTasks} tasks completed
              </h2>
            </div>

            <strong>{progress}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

        </section>

        {/* ADD TASK */}
        <section className="panel">

          <div className="panel-title">
            <span className="small-label">
              TASK CREATION
            </span>

            <h2>
              {editingId !== null
                ? "Edit Task"
                : "Add New Task"}
            </h2>
          </div>

          <div className="task-form">

            <input
              type="text"
              value={taskInput}
              onChange={(event) =>
                setTaskInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder="What needs to be done?"
              className="task-input"
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="select-input"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              className="select-input"
            >
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item} Priority
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              className="date-input"
            />

            <button
              onClick={handleSubmit}
              className="primary-button"
            >
              {editingId !== null
                ? "Save Task"
                : "Add Task"}
            </button>

            {editingId !== null && (
              <button
                onClick={resetForm}
                className="cancel-button"
              >
                Cancel
              </button>
            )}

          </div>

        </section>

        {/* SEARCH AND FILTER */}
        <section className="controls">

          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search your tasks..."
            className="search-input"
          />

          <div className="filter-row">

            <div className="filter-buttons">

              <button
                onClick={() => setFilter("all")}
                className={
                  filter === "all"
                    ? "filter-button active"
                    : "filter-button"
                }
              >
                All
              </button>

              <button
                onClick={() => setFilter("active")}
                className={
                  filter === "active"
                    ? "filter-button active"
                    : "filter-button"
                }
              >
                Active
              </button>

              <button
                onClick={() => setFilter("completed")}
                className={
                  filter === "completed"
                    ? "filter-button active"
                    : "filter-button"
                }
              >
                Completed
              </button>

            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="filter-select"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="filter-select"
            >
              <option value="all">
                All Priorities
              </option>

              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

        </section>

        {/* TASK LIST */}
        <section className="panel task-panel">

          <div className="task-header">

            <div>
              <span className="small-label">
                YOUR PRODUCTIVITY
              </span>

              <h2>Your Tasks</h2>
            </div>

            <span className="task-count">
              {filteredTasks.length} TASKS
            </span>

          </div>

          {filteredTasks.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>No tasks found</h3>

              <p>
                {tasks.length === 0
                  ? "Add your first task to get started."
                  : "Try changing your search or filters."}
              </p>

            </div>

          ) : (

            <div className="task-list">

              {filteredTasks.map((task) => (

                <div
                  key={task.id}
                  className={
                    task.completed
                      ? "task-card completed"
                      : "task-card"
                  }
                >

                  <div className="task-main">

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        toggleTask(task.id)
                      }
                      className="task-checkbox"
                    />

                    <div className="task-information">

                      <div className="task-title-row">

                        <span className="task-text">
                          {task.text}
                        </span>

                        <span
                          className={`priority-badge ${task.priority.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>

                      </div>

                      <div className="task-meta">

                        <span className="category-badge">
                          {task.category}
                        </span>

                        <span
                          className={
                            isOverdue(task)
                              ? "date-badge overdue"
                              : "date-badge"
                          }
                        >
                          Due: {formatDate(task.dueDate)}

                          {isOverdue(task) &&
                            " • Overdue"}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="task-actions">

                    <button
                      onClick={() =>
                        startEditing(task)
                      }
                      className="edit-button"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteTask(task.id)
                      }
                      className="delete-button"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* FOOTER */}
        <footer className="footer">
          <span>DAILY TASK MANAGER</span>
          <span>Built with ReactJS</span>
        </footer>

      </main>
    </div>
  );
}

export default App;