import { useState } from 'react';

const TasksPane = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  const [taskState, setTaskState] = useState(() =>
    (tasks || []).map((task, index) => ({
      ...task,
      id: `${task.task}-${index}`,
      editing: false,
      editText: task.task,
      review: task.status === 'done' ? 'kept' : 'pending',
    }))
  );

  const rows = (tasks || []).map((task, index) => {
    const ui = taskState[index] || {};
    return {
      ...task,
      id: ui.id || `${task.task}-${index}`,
      editing: Boolean(ui.editing),
      editText: ui.editText ?? task.task,
      completed: ui.completed ?? task.completed,
      review: ui.review || 'pending',
    };
  });

  if (!tasks || tasks.length === 0) {
    return (
      <div className="pane tasks-pane">
        <div className="pane-heading">
          <p className="pane-kicker">Care coordination</p>
          <h2>Follow-up Tasks</h2>
        </div>
        <p className="empty-state">No follow-up tasks suggested.</p>
      </div>
    );
  }

  const setReview = (index, review) => {
    setTaskState((prev) => {
      const next = [...prev];
      next[index] = {
        ...(next[index] || {}),
        review,
      };
      return next;
    });
  };

  const handleToggleComplete = (index) => {
    setTaskState((prev) => {
      const next = [...prev];
      next[index] = {
        ...(next[index] || {}),
        completed: !rows[index].completed,
      };
      return next;
    });

    onTaskUpdate(index, {
      ...tasks[index],
      completed: !rows[index].completed,
    });
  };

  const handleStartEdit = (index) => {
    setTaskState((prev) => {
      const next = [...prev];
      next[index] = {
        ...(next[index] || {}),
        editing: true,
        editText: rows[index].task,
      };
      return next;
    });
  };

  const handleSaveEdit = (index) => {
    setTaskState((prev) => {
      const next = [...prev];
      next[index] = {
        ...(next[index] || {}),
        editing: false,
        task: rows[index].editText,
      };
      return next;
    });

    onTaskUpdate(index, {
      ...tasks[index],
      task: rows[index].editText,
    });
  };

  const handleCancelEdit = (index) => {
    setTaskState((prev) => {
      const next = [...prev];
      next[index] = {
        ...(next[index] || {}),
        editing: false,
        editText: tasks[index].task,
      };
      return next;
    });
  };

  const handleDeleteTask = (index) => {
    onTaskDelete(index);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      if (rows[index].editing) {
        handleSaveEdit(index);
      } else {
        handleToggleComplete(index);
      }
    } else if (e.key === 'Escape' && rows[index].editing) {
      handleCancelEdit(index);
    }
  };

  return (
    <div className="pane tasks-pane">
      <div className="pane-heading review-header">
        <div>
          <p className="pane-kicker">Care coordination</p>
          <h2>Follow-up Tasks</h2>
        </div>
        <div className="status-pill pending">Doctor review</div>
      </div>
      <div className="tasks-list">
        {rows.map((task, index) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''} ${task.editing ? 'editing' : ''} ${task.review}`}
          >
            <div className="task-content">
              <input
                type="checkbox"
                checked={task.completed || false}
                onChange={() => handleToggleComplete(index)}
                className="task-checkbox"
                disabled={task.editing}
              />
              {task.editing ? (
                <div className="task-editing">
                  <input
                    type="text"
                    value={task.editText}
                    onChange={(e) => {
                      setTaskState((prev) => {
                        const next = [...prev];
                        next[index] = {
                          ...next[index],
                          editText: e.target.value,
                        };
                        return next;
                      });
                    }}
                    onBlur={() => handleSaveEdit(index)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    autoComplete="off"
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleSaveEdit(index)} className="edit-button">
                      Save
                    </button>
                    <button onClick={() => handleCancelEdit(index)} className="edit-button">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <span className="task-text">{task.task}</span>
              )}
            </div>

            <div className="item-review-meta">
              <span className={`status-pill ${task.review}`}>{task.review}</span>
            </div>

            <div className="task-actions">
              {!task.editing && (
                <>
                  <button onClick={() => handleStartEdit(index)} className="action-button">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTask(index)} className="action-button danger">
                    Delete
                  </button>
                </>
              )}
            </div>

            <div className="billing-actions task-review-actions">
              <button onClick={() => setReview(index, 'kept')} className="review-button">
                Keep
              </button>
              <button onClick={() => setReview(index, 'declined')} className="review-button danger">
                Remove
              </button>
              <button onClick={() => setReview(index, 'pending')} className="review-button muted">
                Reset
              </button>
            </div>

            <div className="task-source">
              <strong>From transcript:</strong> "{task.source}"
            </div>

            {task.completed && <div className="task-resolved">Resolved</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPane;
