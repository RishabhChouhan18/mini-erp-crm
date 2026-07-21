import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Building2,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  useAuth,
} from "../context/AuthContext";

const Login = () => {
  const navigate =
    useNavigate();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(
        email,
        password
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between bg-slate-900">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 rounded-xl bg-blue-600">
            <Building2 size={26} />
          </div>

          <div>
            <h1 className="font-bold text-xl">
              OpsFlow ERP
            </h1>

            <p className="text-xs text-slate-400">
              Operations Management Portal
            </p>
          </div>
        </div>

        <div>
          <p className="text-blue-400 font-medium mb-4">
            ERP + CRM OPERATIONS
          </p>

          <h2 className="text-5xl font-bold text-white leading-tight max-w-lg">
            Manage customers,
            inventory and sales
            from one place.
          </h2>

          <p className="mt-6 text-slate-400 max-w-lg text-lg">
            A unified workspace for sales,
            warehouse and accounts teams.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          Secure role-based operations portal
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Building2 />

            <span className="font-bold text-xl">
              OpsFlow ERP
            </span>
          </div>

          <p className="text-sm font-semibold text-blue-600 mb-2">
            WELCOME BACK
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Sign in to your account
          </h2>

          <p className="text-slate-500 mt-2 mb-8">
            Enter your credentials to access
            the operations portal.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="admin@demo.com"
                  className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-3 flex items-center justify-center gap-2"
            >
              {loading && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Authorized employees only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;