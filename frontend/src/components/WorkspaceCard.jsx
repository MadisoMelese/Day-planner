import { Link } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";

const DELETE_WORKSPACE = gql`
  mutation ($id: ID!) {
    deleteWorkspace(id: $id)
  }
`;

export default function WorkspaceCard({ workspace }) {
  const [deleteWorkspace] = useMutation(DELETE_WORKSPACE);

  const handleDelete = async (e) => {
    e.stopPropagation(); // prevent link click
    if (!confirm("Are you sure you want to delete this workspace?")) return;

    try {
      await deleteWorkspace({ variables: { id: workspace.id } });
      window.location.reload(); // quick reload to update UI (we’ll refetch later)
    } catch (err) {
      console.error("❌ Failed to delete workspace:", err);
    }
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
      <Link to={`/workspace/${workspace.id}`} className="block">
        <h2 className="text-xl font-semibold text-blue-400 mb-2">
          {workspace.name}
        </h2>
        <p className="text-gray-400 text-sm mb-3">
          {workspace.description || "No description"}
        </p>
        <p className="text-xs text-gray-500">
          Created at: {new Date(workspace.created_at).toLocaleDateString()}
        </p>
      </Link>

      <button
        onClick={handleDelete}
        className="mt-3 bg-red-600 hover:bg-red-700 text-sm px-3 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );
}
