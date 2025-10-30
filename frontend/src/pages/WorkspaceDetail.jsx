import { useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import TaskCard from "../components/TaskCard";
import { useState } from "react";

const GET_WORKSPACE = gql`
  query ($id: ID!) {
    getWorkspace(id: $id) {
      id
      name
      description
      tasks {
        id
        title
        status
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

export default function WorkspaceDetail() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useQuery(GET_WORKSPACE, {
    variables: { id },
  });
  const [createTask] = useMutation(CREATE_TASK);
  const [newTitle, setNewTitle] = useState("");

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
  if (error) return <p className="text-center mt-10 text-red-500">Error fetching workspace!</p>;

  const ws = data?.getWorkspace;

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
        {ws.tasks.length > 0 ? (
          ws.tasks.map((t) => <TaskCard key={t.id} task={t} />)
        ) : (
          <p className="text-gray-500 italic">No tasks yet.</p>
        )}
      </div>
    </div>
  );
}
