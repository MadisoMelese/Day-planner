import { useMutation, gql } from "@apollo/client";

const UPDATE_TASK = gql`
  mutation ($id: ID!, $status: String!) {
    updateTask(id: $id, status: $status) {
      id
      title
      status
    }
  }
`;

const DELETE_TASK = gql`
  mutation ($id: ID!) {
    deleteTask(id: $id)
  }
`;

export default function TaskCard({ task }) {
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const toggleStatus = async () => {
    const newStatus = task.status === "DONE" ? "PENDING" : "DONE";
    await updateTask({ variables: { id: task.id, status: newStatus } });
    window.location.reload(); // quick refresh
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await deleteTask({ variables: { id: task.id } });
    window.location.reload();
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition">
      <h3
        className={`text-lg font-semibold ${
          task.status === "DONE" ? "line-through text-green-400" : "text-white"
        }`}
      >
        {task.title}
      </h3>

      <p className="text-sm text-gray-400 mb-3">Status: {task.status}</p>

      <div className="flex gap-3">
        <button
          onClick={toggleStatus}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
        >
          {task.status === "DONE" ? "Mark Pending" : "Mark Done"}
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
