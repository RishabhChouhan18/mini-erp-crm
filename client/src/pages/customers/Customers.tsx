import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import api from "../../api/axios";

import type {
  Customer,
} from "../../types/customer";

const Customers = () => {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/customers", {
          params: {
            page,
            limit: 10,

            ...(search && {
              search,
            }),

            ...(status && {
              status,
            }),
          },
        });

      const responseData =
        response.data;

      setCustomers(
        responseData.data || []
      );

      setTotalPages(
        responseData.pagination
          ?.totalPages || 1
      );

      setTotal(
        responseData.pagination
          ?.total || 0
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Heading */}

      <div className="
        flex flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
        mb-6
      ">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Customers
          </h1>

          <p className="text-slate-500 mt-1">
            Manage leads, customers and
            CRM follow-ups.
          </p>
        </div>

        <Link
          to="/customers/new"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-4 py-2.5
            rounded-lg
            text-sm font-medium
            transition
          "
        >
          <Plus size={18} />

          Add Customer
        </Link>
      </div>

      {/* Filters */}

      <div className="
        bg-white
        border border-slate-200
        rounded-xl
        p-4
        shadow-sm
        mb-5
      ">
        <div className="
          flex
          flex-col
          md:flex-row
          gap-3
        ">
          <div className="relative flex-1">
            <Search
              size={18}
              className="
                absolute
                left-3 top-3
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by name, mobile or business..."
              className="
                w-full
                border border-slate-300
                rounded-lg
                py-2.5
                pl-10 pr-4
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="
              border border-slate-300
              rounded-lg
              px-4 py-2.5
              bg-white
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            <option value="">
              All Statuses
            </option>

            <option value="LEAD">
              Lead
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* Table */}

      <div className="
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        overflow-hidden
      ">
        <div className="
          px-5 py-4
          border-b border-slate-200
          flex justify-between
          items-center
        ">
          <div>
            <h2 className="font-semibold text-slate-900">
              Customer Directory
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {total} customer
              {total !== 1 && "s"} found
            </p>
          </div>
        </div>

        {error ? (
          <div className="m-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center">
            <Users
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="font-medium text-slate-700 mt-4">
              No customers found
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Add your first customer or
              change the search filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5">
                <thead>
                  <tr className="
                    bg-slate-50
                    border-b border-slate-200
                    text-left
                    text-xs
                    uppercase
                    tracking-wide
                    text-slate-500
                  ">
                    <th className="px-5 py-3">
                      Customer
                    </th>

                    <th className="px-5 py-3">
                      Contact
                    </th>

                    <th className="px-5 py-3">
                      Type
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    <th className="px-5 py-3">
                      Follow-up
                    </th>

                    <th className="px-5 py-3 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map(
                    (customer) => (
                      <tr
                        key={
                          customer.id
                        }
                        className="
                          border-b
                          border-slate-100
                          last:border-0
                          hover:bg-slate-50
                          transition
                        "
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-sm text-slate-900">
                            {
                              customer.name
                            }
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {
                              customer.businessName
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm">
                            {
                              customer.mobile
                            }
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {customer.email ||
                              "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="
                            text-xs
                            font-medium
                            bg-slate-100
                            text-slate-700
                            px-2.5 py-1
                            rounded-full
                          ">
                            {
                              customer.customerType
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              customer.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {customer.followUpDate
                            ? new Date(
                                customer.followUpDate
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/customers/${customer.id}`}
                            className="
                              inline-flex
                              items-center gap-1.5
                              text-sm
                              text-blue-600
                              hover:text-blue-800
                              font-medium
                            "
                          >
                            <Eye
                              size={16}
                            />

                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}

            <div className="
              px-5 py-4
              border-t border-slate-200
              flex items-center
              justify-between
            ">
              <p className="text-sm text-slate-500">
                Page {page} of{" "}
                {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (prev) =>
                        prev - 1
                    )
                  }
                  className="
                    p-2
                    border border-slate-300
                    rounded-lg
                    disabled:opacity-40
                    hover:bg-slate-50
                  "
                >
                  <ChevronLeft
                    size={18}
                  />
                </button>

                <button
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage(
                      (prev) =>
                        prev + 1
                    )
                  }
                  className="
                    p-2
                    border border-slate-300
                    rounded-lg
                    disabled:opacity-40
                    hover:bg-slate-50
                  "
                >
                  <ChevronRight
                    size={18}
                  />
                </button>
              </div>
            </div>
          </>
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
    ACTIVE:
      "bg-green-100 text-green-700",

    LEAD:
      "bg-blue-100 text-blue-700",

    INACTIVE:
      "bg-slate-200 text-slate-600",
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

export default Customers;