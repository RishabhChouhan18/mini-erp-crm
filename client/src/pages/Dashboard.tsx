import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  UserCheck,
  Package,
  TriangleAlert,
  FileText,
  CircleCheckBig,
  CalendarClock,
  Loader2,
} from "lucide-react";

import api from "../api/axios";

import {
  useAuth,
} from "../context/AuthContext";

interface DashboardData {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    lowStockCount: number;
    totalChallans: number;
    confirmedChallans: number;
  };

  recentChallans: Array<{
    id: string;
    challanNumber: string;
    status: string;
    totalQuantity: number;
    createdAt: string;

    customer: {
      id: string;
      name: string;
      businessName: string;
    };
  }>;

  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    minimumStock: number;
    warehouse: string;
  }>;

  upcomingFollowUps: Array<{
    id: string;
    name: string;
    businessName: string;
    mobile: string;
    status: string;
    followUpDate: string;
  }>;
}

const Dashboard = () => {
  const {
    user,
  } = useAuth();

  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/dashboard/summary"
          );

        setData(response.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-blue-600"
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
        {error ||
          "Unable to load dashboard"}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Customers",
      value:
        data.stats.totalCustomers,
      icon: Users,
    },

    {
      label: "Active Customers",
      value:
        data.stats.activeCustomers,
      icon: UserCheck,
    },

    {
      label: "Total Products",
      value:
        data.stats.totalProducts,
      icon: Package,
    },

    {
      label: "Low Stock",
      value:
        data.stats.lowStockCount,
      icon: TriangleAlert,
    },

    {
      label: "Total Challans",
      value:
        data.stats.totalChallans,
      icon: FileText,
    },

    {
      label: "Confirmed",
      value:
        data.stats.confirmedChallans,
      icon: CircleCheckBig,
    },
  ];

  return (
    <div>
      {/* Heading */}

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-1">
          Welcome back, {user?.name}.
          Here's your operations overview.
        </p>
      </div>

      {/* Stats */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-6
        gap-4
      ">
        {stats.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <div
              key={label}
              className="
                bg-white
                border border-slate-200
                rounded-xl
                p-5
                shadow-sm
              "
            >
              <div className="flex items-center justify-between">
                <div className="
                  w-10 h-10
                  bg-slate-100
                  rounded-lg
                  flex items-center justify-center
                  text-slate-600
                ">
                  <Icon size={20} />
                </div>
              </div>

              <p className="text-2xl font-bold text-slate-900 mt-5">
                {value}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {label}
              </p>
            </div>
          )
        )}
      </div>

      {/* Main widgets */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-6
        mt-6
      ">
        {/* Recent Challans */}

        <div className="
          xl:col-span-2
          bg-white
          border border-slate-200
          rounded-xl
          shadow-sm
        ">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Recent Sales Challans
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Latest sales activity
            </p>
          </div>

          {data.recentChallans.length ===
          0 ? (
            <div className="p-10 text-center text-slate-500">
              No challans created yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b">
                    <th className="px-5 py-3">
                      Challan
                    </th>

                    <th className="px-5 py-3">
                      Customer
                    </th>

                    <th className="px-5 py-3">
                      Qty
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.recentChallans.map(
                    (challan) => (
                      <tr
                        key={challan.id}
                        className="border-b last:border-0 text-sm"
                      >
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {
                            challan.challanNumber
                          }
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {
                              challan.customer
                                .name
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            {
                              challan.customer
                                .businessName
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {
                            challan.totalQuantity
                          }
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              challan.status
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock */}

        <div className="
          bg-white
          border border-slate-200
          rounded-xl
          shadow-sm
        ">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Low Stock Alerts
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Products requiring attention
            </p>
          </div>

          <div className="p-4">
            {data.lowStockProducts
              .length === 0 ? (
              <div className="py-8 text-center">
                <CircleCheckBig
                  className="mx-auto text-green-500"
                  size={28}
                />

                <p className="text-sm text-slate-500 mt-3">
                  Inventory levels look good.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.lowStockProducts.map(
                  (product) => (
                    <div
                      key={product.id}
                      className="
                        p-3
                        rounded-lg
                        bg-amber-50
                        border border-amber-100
                      "
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            {product.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {product.sku}
                          </p>
                        </div>

                        <span className="text-sm font-bold text-amber-700">
                          {
                            product.currentStock
                          }{" "}
                          left
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        Minimum:{" "}
                        {
                          product.minimumStock
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Follow Ups */}

      <div className="
        mt-6
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
      ">
        <div className="p-5 border-b border-slate-200 flex items-center gap-3">
          <CalendarClock
            size={20}
            className="text-blue-600"
          />

          <div>
            <h2 className="font-semibold text-slate-900">
              Upcoming CRM Follow-ups
            </h2>

            <p className="text-sm text-slate-500">
              Customers requiring follow-up
            </p>
          </div>
        </div>

        {data.upcomingFollowUps.length ===
        0 ? (
          <div className="p-10 text-center text-slate-500">
            No upcoming follow-ups.
          </div>
        ) : (
          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-4
            p-5
          ">
            {data.upcomingFollowUps.map(
              (customer) => (
                <div
                  key={customer.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {customer.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {
                          customer.businessName
                        }
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        customer.status
                      }
                    />
                  </div>

                  <p className="text-sm mt-4 text-slate-600">
                    {customer.mobile}
                  </p>

                  <p className="text-xs text-blue-600 font-medium mt-2">
                    Follow-up:{" "}
                    {new Date(
                      customer.followUpDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({
  status,
}: {
  status: string;
}) => {
  const styles: Record<
    string,
    string
  > = {
    CONFIRMED:
      "bg-green-100 text-green-700",

    DRAFT:
      "bg-amber-100 text-amber-700",

    CANCELLED:
      "bg-red-100 text-red-700",

    ACTIVE:
      "bg-green-100 text-green-700",

    LEAD:
      "bg-blue-100 text-blue-700",

    INACTIVE:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`
        inline-flex
        px-2.5 py-1
        rounded-full
        text-xs font-medium

        ${
          styles[status] ||
          "bg-slate-100 text-slate-600"
        }
      `}
    >
      {status}
    </span>
  );
};

export default Dashboard;