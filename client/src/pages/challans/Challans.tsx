import {
  useEffect,
  useState,
} from "react";

import {
  FileText,
  Loader2,
  Plus,
  Eye,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import api from "../../api/axios";

import type {
  Challan,
} from "../../types/challan";

import {
  useAuth,
} from "../../context/AuthContext";

const Challans = () => {
  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/challans");

      const data =
        response.data.data;

      setChallans(
        Array.isArray(data)
          ? data
          : data?.challans || []
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load challans"
      );
    } finally {
      setLoading(false);
    }
  };

  const { hasRole } =
  useAuth();
  
  return (
    <div>
      <div className="
        flex flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4 mb-6
      ">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Sales Challans
          </h1>

          <p className="text-slate-500 mt-1">
            Create and manage product
            dispatch challans.
          </p>
        </div>

        {hasRole([
  "ADMIN",
  "SALES",
]) && (
  <Link
    to="/challans/new"
    className="
      inline-flex items-center
      justify-center gap-2
      bg-blue-600
      hover:bg-blue-700
      text-white
      px-4 py-2.5
      rounded-lg
      text-sm font-medium
    "
  >
    <Plus size={18} />

    Create Challan
  </Link>
)}
      </div>

      <div className="
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        overflow-hidden
      ">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold">
            Challan Directory
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {challans.length} challans
          </p>
        </div>

        {error ? (
          <div className="m-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2
              className="animate-spin text-blue-600"
            />
          </div>
        ) : challans.length === 0 ? (
          <div className="py-16 text-center">
            <FileText
              size={42}
              className="mx-auto text-slate-300"
            />

            <p className="font-medium mt-4">
              No challans yet
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Create your first sales
              challan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200">
              <thead>
                <tr className="
                  bg-slate-50
                  text-xs uppercase
                  text-slate-500
                  text-left
                ">
                  <th className="px-5 py-3">
                    Challan
                  </th>

                  <th className="px-5 py-3">
                    Customer
                  </th>

                  <th className="px-5 py-3">
                    Quantity
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {challans.map(
                  (challan) => (
                    <tr
                      key={challan.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-sm">
                        {
                          challan.challanNumber
                        }
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium">
                          {
                            challan.customer
                              ?.name
                          }
                        </p>

                        <p className="text-xs text-slate-500">
                          {
                            challan.customer
                              ?.businessName
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm">
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

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          challan.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/challans/${challan.id}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
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
    DRAFT:
      "bg-slate-100 text-slate-700",

    CONFIRMED:
      "bg-green-100 text-green-700",

    CANCELLED:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`
        px-2.5 py-1
        rounded-full
        text-xs font-medium
        ${
          styles[status] ||
          "bg-slate-100"
        }
      `}
    >
      {status}
    </span>
  );
};

export default Challans;