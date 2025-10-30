import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/auth/register", {
        email,
        password,
      });
      setMessage("✅ Registration successful! You can now login.");
    } catch (err) {
      setMessage("❌ Registration failed. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-6 rounded-xl shadow-lg w-96 text-white"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-700 border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 rounded bg-gray-700 border border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-semibold"
        >
          Register
        </button>
        {message && <p className="text-center mt-3 text-sm">{message}</p>}
      </form>
    </div>
  );
}
