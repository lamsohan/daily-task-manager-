import { useEffect, useMemo, useState } from "react";
import "./App.css";

const CATEGORIES = ["College", "Personal", "Projects", "Fitness", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("dailyTasks");

      if (!savedTasks) return [];

      const parsedTasks = JSON.parse(savedTasks);

      return parsedTasks.map((task) => ({
        ...task,
        category: task.category || "Other",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || "",
      }));
    } catch {
      return [];
    }
  });

  const [activeView, setActiveView] = useState("dashboard");

  const [taskText, setTaskText] = useState("");
  const [category, setCategory] = useState("College");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("dailyTasks", JSON.stringify(tasks));
  }, [tasks]);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((task) => task.completed).length;

  const activeTasks = totalTasks - completedTasks;

  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const overdueTasks = tasks.filter(
    (task) => !task.completed && task.dueDate && isOverdue(task.dueDate)
  ).length;

  const addTask = (e) => {
    e.preventDefault();

    if (!taskText.trim()) {
      setError("Please enter a task.");
      return;
    }

    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText.trim(),
      category,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prevTasks) => [newTask, ...prevTasks]);

    resetForm();
  };

  const saveEdit = (e) => {
    e.preventDefault();

    if (!taskText.trim()) {
      setError("Please enter a task.");
      return;
    }

    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingId
          ? {
              ...task,
              text: taskText.trim(),
              category,
              priority,
              dueDate,
            }
          : task
      )
    );

    resetForm();
  };

  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));

    if (editingId === id) {
      resetForm();
    }
  };

  const toggleTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setTaskText(task.text);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setError("");

    setActiveView("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setTaskText("");
    setCategory("College");
    setPriority("Medium");
    setDueDate("");
    setEditingId(null);
    setError("");
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.text
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && !task.completed) ||
        (statusFilter === "Completed" && task.completed);

      const matchesCategory =
        categoryFilter === "All" || task.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    categoryFilter,
    priorityFilter,
  ]);

  const completedTaskList = tasks.filter((task) => task.completed);

  const dashboardRecentTasks = [...tasks]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="app">
      <header className="top-header">
        <div className="brand-section">
          <div className="brand-icon">✓</div>

          <div>
            <h1>Daily Task Manager</h1>
            <p>Organize your day. Complete your goals.</p>
          </div>
        </div>

        <div className="header-progress">
          <span>Overall Progress</span>

          <strong>{progress}%</strong>

          <div className="mini-progress">
            <div style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </header>

      <nav className="navigation">
        <button
          className={activeView === "dashboard" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveView("dashboard")}
        >
          <span>⌂</span>
          Dashboard
        </button>

        <button
          className={activeView === "all" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveView("all")}
        >
          <span>☷</span>
          All Tasks
          <b>{totalTasks}</b>
        </button>

        <button
          className={
            activeView === "completed" ? "nav-btn active" : "nav-btn"
          }
          onClick={() => setActiveView("completed")}
        >
          <span>✓</span>
          Completed
          <b>{completedTasks}</b>
        </button>
      </nav>

      <main className="main-container">
        {activeView === "dashboard" && (
          <Dashboard
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            activeTasks={activeTasks}
            progress={progress}
            overdueTasks={overdueTasks}
            recentTasks={dashboardRecentTasks}
            onViewAll={() => setActiveView("all")}
            onToggleTask={toggleTask}
          />
        )}

        {activeView === "all" && (
          <AllTasksView
            taskText={taskText}
            setTaskText={setTaskText}
            category={category}
            setCategory={setCategory}
            priority={priority}
            setPriority={setPriority}
            dueDate={dueDate}
            setDueDate={setDueDate}
            editingId={editingId}
            error={error}
            addTask={addTask}
            saveEdit={saveEdit}
            resetForm={resetForm}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            filteredTasks={filteredTasks}
            onToggleTask={toggleTask}
            onEditTask={startEditing}
            onDeleteTask={deleteTask}
          />
        )}

        {activeView === "completed" && (
          <CompletedView
            completedTasks={completedTaskList}
            onToggleTask={toggleTask}
            onEditTask={startEditing}
            onDeleteTask={deleteTask}
          />
        )}
      </main>

      <footer className="footer">
        <p>
          Daily Task Manager <span>•</span> Built with ReactJS
        </p>
      </footer>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  totalTasks,
  completedTasks,
  activeTasks,
  progress,
  overdueTasks,
  recentTasks,
  onViewAll,
  onToggleTask,
}) {
  return (
    <section className="view-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR DAY AT A GLANCE</span>
          <h2>Dashboard</h2>
          <p>Track your productivity and stay focused.</p>
        </div>

        <button className="primary-btn" onClick={onViewAll}>
          + Manage Tasks
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon="☷"
          description="Tasks created"
        />

        <StatCard
          title="Active"
          value={activeTasks}
          icon="◷"
          description="Still to complete"
        />

        <StatCard
          title="Completed"
          value={completedTasks}
          icon="✓"
          description="Successfully done"
        />

        <StatCard
          title="Overdue"
          value={overdueTasks}
          icon="!"
          description="Need attention"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PRODUCTIVITY</span>
              <h3>Completion Progress</h3>
            </div>

            <strong className="large-percentage">{progress}%</strong>
          </div>

          <div className="large-progress">
            <div style={{ width: `${progress}%` }}></div>
          </div>

          <p className="progress-message">
            {progress === 100
              ? "Excellent! Every task is complete."
              : progress >= 75
              ? "Almost there. Keep going!"
              : progress >= 50
              ? "Good progress. Stay consistent."
              : progress > 0
              ? "You're getting started. Keep moving."
              : "Add your first task to begin."}
          </p>
        </div>

        <div className="panel quick-panel">
          <span className="eyebrow">QUICK SUMMARY</span>
          <h3>Today's Focus</h3>

          <div className="summary-line">
            <span>Completed</span>
            <strong>{completedTasks}</strong>
          </div>

          <div className="summary-line">
            <span>Remaining</span>
            <strong>{activeTasks}</strong>
          </div>

          <div className="summary-line">
            <span>Overdue</span>
            <strong>{overdueTasks}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">RECENT ACTIVITY</span>
            <h3>Recent Tasks</h3>
          </div>

          <button className="text-btn" onClick={onViewAll}>
            View all →
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <EmptyState
            icon="✦"
            title="No tasks yet"
            message="Create a task and start organizing your day."
          />
        ) : (
          <div className="recent-list">
            {recentTasks.map((task) => (
              <div className="recent-task" key={task.id}>
                <button
                  className={
                    task.completed
                      ? "check-circle checked"
                      : "check-circle"
                  }
                  onClick={() => onToggleTask(task.id)}
                >
                  {task.completed ? "✓" : ""}
                </button>

                <div className="recent-task-content">
                  <strong className={task.completed ? "completed-text" : ""}>
                    {task.text}
                  </strong>

                  <span>
                    {task.category} • {formatDate(task.dueDate)}
                  </span>
                </div>

                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================
   ALL TASKS
========================= */

function AllTasksView({
  taskText,
  setTaskText,
  category,
  setCategory,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  editingId,
  error,
  addTask,
  saveEdit,
  resetForm,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  filteredTasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) {
  return (
    <section className="view-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">TASK MANAGEMENT</span>
          <h2>All Tasks</h2>
          <p>Add, organize, edit and complete your daily tasks.</p>
        </div>
      </div>

      <div className="panel task-form-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              {editingId ? "EDIT TASK" : "NEW TASK"}
            </span>

            <h3>{editingId ? "Update your task" : "Create a task"}</h3>
          </div>
        </div>

        <form onSubmit={editingId ? saveEdit : addTask}>
          <div className="form-grid">
            <div className="form-group task-input-group">
              <label>Task</label>

              <input
                type="text"
                value={taskText}
                onChange={(e) => {
                  setTaskText(e.target.value);
                }}
                placeholder="What do you need to accomplish?"
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              {editingId ? "Save Changes" : "Add Task"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel filters-panel">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
          />
        </div>

        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Completed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All</option>

            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option>All</option>

            {PRIORITIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="task-list-heading">
        <div>
          <span className="eyebrow">YOUR TASKS</span>
          <h3>{filteredTasks.length} Tasks Found</h3>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon="⌕"
            title="No tasks found"
            message="Try changing your search or filters."
          />
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================
   COMPLETED VIEW
========================= */

function CompletedView({
  completedTasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) {
  return (
    <section className="view-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACHIEVEMENTS</span>
          <h2>Completed Tasks</h2>
          <p>Everything you've successfully finished.</p>
        </div>
      </div>

      <div className="completed-banner">
        <div className="completed-banner-icon">✓</div>

        <div>
          <strong>{completedTasks.length} tasks completed</strong>
          <p>Keep building your momentum.</p>
        </div>
      </div>

      {completedTasks.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon="✓"
            title="Nothing completed yet"
            message="Complete a task and it will appear here."
          />
        </div>
      ) : (
        <div className="task-list">
          {completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================= */

function StatCard({ title, value, icon, description }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  return (
    <article className={task.completed ? "task-card completed" : "task-card"}>
      <button
        className={
          task.completed ? "task-check checked" : "task-check"
        }
        onClick={() => onToggle(task.id)}
        aria-label="Toggle task completion"
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="task-card-main">
        <div className="task-card-title-row">
          <h3 className={task.completed ? "completed-text" : ""}>
            {task.text}
          </h3>

          <PriorityBadge priority={task.priority} />
        </div>

        <div className="task-meta">
          <span className="category-badge">{task.category}</span>

          <span
            className={
              isOverdue(task.dueDate) && !task.completed
                ? "date-badge overdue"
                : "date-badge"
            }
          >
            ◷ {formatDate(task.dueDate)}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button
          className="icon-btn"
          onClick={() => onEdit(task)}
          title="Edit task"
        >
          ✎
        </button>

        <button
          className="icon-btn delete"
          onClick={() => onDelete(task.id)}
          title="Delete task"
        >
          ×
        </button>
      </div>
    </article>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`priority-badge ${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

/* =========================
   HELPERS
========================= */

function formatDate(dateString) {
  if (!dateString) return "No due date";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(dateString) {
  if (!dateString) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${dateString}T00:00:00`);

  return dueDate < today;
}

export default App;