import {
  Building2,
  LayoutDashboard,
  Users,
  Package,
  FileText,
  LogOut,
  X,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({
  open,
  onClose,
}: SidebarProps) => {
  const {
    user,
    logout,
  } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: [
        "ADMIN",
        "SALES",
        "WAREHOUSE",
        "ACCOUNTS",
      ],
    },

    {
      name: "Customers",
      path: "/customers",
      icon: Users,
      roles: [
        "ADMIN",
        "SALES",
      ],
    },

    {
      name: "Products",
      path: "/products",
      icon: Package,
      roles: [
        "ADMIN",
        "SALES",
        "WAREHOUSE",
        "ACCOUNTS",
      ],
    },

    {
      name: "Sales Challans",
      path: "/challans",
      icon: FileText,
      roles: [
        "ADMIN",
        "SALES",
        "WAREHOUSE",
        "ACCOUNTS",
      ],
    },
  ];

  const visibleMenuItems =
    menuItems.filter((item) =>
      item.roles.includes(
        user?.role || ""
      )
    );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-slate-950 text-white
          flex flex-col
          transition-transform duration-300
          lg:translate-x-0

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}

        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Building2 size={23} />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                OpsFlow
              </h1>

              <p className="text-xs text-slate-400">
                ERP + CRM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-slate-400"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 px-3 mb-3">
            OPERATIONS
          </p>

          {visibleMenuItems.map(
            ({
              name,
              path,
              icon: Icon,
            }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({
                  isActive,
                }) =>
                  `
                  flex items-center gap-3
                  px-3 py-2.5
                  rounded-lg
                  text-sm font-medium
                  transition

                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }
                  `
                }
              >
                <Icon size={19} />

                {name}
              </NavLink>
            )
          )}
        </nav>

        {/* User */}

        <div className="p-4 border-t border-slate-800">
          <div className="px-3 mb-4">
            <p className="text-sm font-semibold truncate">
              {user?.name}
            </p>

            <p className="text-xs text-slate-500 truncate">
              {user?.email}
            </p>

            <span className="inline-block mt-2 text-xs bg-slate-800 px-2 py-1 rounded">
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="
              w-full
              flex items-center gap-3
              px-3 py-2.5
              rounded-lg
              text-sm
              text-slate-400
              hover:bg-red-500/10
              hover:text-red-400
              transition
            "
          >
            <LogOut size={18} />

            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;