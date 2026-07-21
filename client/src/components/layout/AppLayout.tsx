import {
  useState,
} from "react";

import {
  Menu,
  Bell,
} from "lucide-react";

import {
  Outlet,
} from "react-router-dom";

import Sidebar from "./Sidebar";

import {
  useAuth,
} from "../../context/AuthContext";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const {
    user,
  } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="lg:ml-64 min-h-screen">
        {/* Header */}

        <header className="
          sticky top-0 z-30
          h-16
          bg-white
          border-b border-slate-200
          flex items-center
          justify-between
          px-4 md:px-6
        ">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm text-slate-500">
                Operations Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell size={20} />

              <span className="
                absolute top-1.5 right-1.5
                w-2 h-2
                bg-red-500
                rounded-full
              " />
            </button>

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                {user?.role}
              </p>
            </div>

            <div className="
              w-9 h-9
              rounded-full
              bg-blue-100
              text-blue-700
              flex items-center justify-center
              font-bold
            ">
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;