// TaskPipe queue — minimal stub so the sandbox is a plausible project.
class TaskPipeError extends Error {}
class ValidationError extends TaskPipeError {}
class QueueFullError extends TaskPipeError {}

function createQueue({ name, maxSize = 1000 } = {}) {
  if (!name) throw new ValidationError("options.name is required");
  const items = [];
  return {
    push(task) {
      if (items.length >= maxSize) throw new QueueFullError(`${name} is full`);
      if (!task || !task.id || !task.type) {
        throw new ValidationError("task needs id and type");
      }
      items.push(task);
    },
    pop() {
      return items.shift() ?? null;
    },
    size() {
      return items.length;
    },
  };
}

module.exports = { createQueue, TaskPipeError, ValidationError, QueueFullError };
