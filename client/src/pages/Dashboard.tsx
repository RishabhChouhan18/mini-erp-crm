import {
  useAuth,
} from "../context/AuthContext";

const Dashboard = () => {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-3">
        Welcome, {user?.name}
      </p>

      <p>
        Role: {user?.role}
      </p>

      <button
        onClick={logout}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;