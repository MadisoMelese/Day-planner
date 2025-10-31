export default function TaskCard({ task, onDelete, onToggleStatus }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <p className="text-sm text-gray-400">{task.description || "No description"}</p>
      </div>

      <div className="flex justify-between items-center mt-3">
        <span
          className={`px-2 py-1 text-xs rounded ${
            task.status === "done" ? "bg-green-600" : "bg-yellow-600"
          }`}
        >
          {task.status}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onToggleStatus}
            className="text-blue-400 hover:text-blue-500"
          >
            ✓
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
