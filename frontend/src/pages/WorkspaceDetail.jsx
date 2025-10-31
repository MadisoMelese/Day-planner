import { useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import TaskCard from "../components/TaskCard";
import { useState } from "react";

// 🧩 1. All GraphQL queries & mutations
const GET_WORKSPACE = gql`
  query ($id: ID!) {
    getWorkspace(id: $id) {
      id
      name
      description
      tasks {
        id
        title
        description
        status
        created_at
      }
    }
  }
`;

const CREATE_TASK = gql`
  mutation ($workspaceId: ID!, $title: String!) {
    createTask(workspaceId: $workspaceId, title: $title) {
      id
      title
      status
    }
  }
`;

const UPDATE_TASK = gql`
  mutation ($id: ID!, $title: String, $status: String) {
    updateTask(id: $id, title: $title, status: $status) {
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

export default function WorkspaceDetail() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useQuery(GET_WORKSPACE, {
    variables: { id },
  });

  // 🧩 2. ADD THESE HERE 👇 (after `useQuery`)
  const [createTask] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const [newTitle, setNewTitle] = useState("");

  // 🧩 3. Then your functions below
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({ variables: { workspaceId: id, title: newTitle } });
      setNewTitle("");
      refetch();
    } catch (err) {
      console.error("❌ Error creating task:", err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (error) {
    console.error("GraphQL error:", error);
    return (
      <div className="text-center mt-10 text-red-400">
        <p>❌ Error fetching workspace:</p>
        <pre className="text-sm text-gray-400">{error.message}</pre>
      </div>
    );
  }

  const ws = data?.getWorkspace;

  // 🧩 4. JSX rendering (show tasks, form, etc.)
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">{ws.name}</h1>
      <p className="text-gray-400 mb-6">{ws.description}</p>

      <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New task title"
          className="flex-1 p-2 rounded bg-gray-700"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 px-4 rounded"
        >
          + Add
        </button>
      </form>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
        {ws?.tasks && ws.tasks.length > 0 ? (
          ws.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={async () => {
                await deleteTask({ variables: { id: task.id } });
                refetch();
              }}
              onToggleStatus={async () => {
                const newStatus = task.status === "pending" ? "done" : "pending";
                await updateTask({ variables: { id: task.id, status: newStatus } });
                refetch();
              }}
            />
          ))
        ) : (
          <p className="text-gray-500 italic">No tasks yet.</p>
        )}
      </div>
    </div>
  );
}
