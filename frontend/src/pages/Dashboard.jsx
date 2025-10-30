import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import WorkspaceCard from "../components/WorkspaceCard";

const GET_WORKSPACES = gql`
  query {
    getAllWorkspaces {
      id
      name
      description
      created_at
    }
  }
`;

const CREATE_WORKSPACE = gql`
  mutation ($name: String!, $description: String) {
    createWorkspace(name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

export default function Dashboard() {
  const { data, loading, error, refetch } = useQuery(GET_WORKSPACES);
  const [createWorkspace] = useMutation(CREATE_WORKSPACE);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createWorkspace({
        variables: { name: newName, description: newDesc },
      });
      setNewName("");
      setNewDesc("");
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error("❌ Error creating workspace:", err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error loading workspaces!</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workspaces</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          + New Workspace
        </button>
      </div>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {data?.getAllWorkspaces.map((ws) => (
          <WorkspaceCard key={ws.id} workspace={ws} />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <form
            onSubmit={handleCreate}
            className="bg-gray-800 p-6 rounded-lg w-96"
          >
            <h2 className="text-xl font-semibold mb-3">Create Workspace</h2>
            <input
              type="text"
              placeholder="Workspace Name"
              className="w-full mb-3 p-2 rounded bg-gray-700"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <textarea
              placeholder="Description (optional)"
              className="w-full mb-3 p-2 rounded bg-gray-700"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
