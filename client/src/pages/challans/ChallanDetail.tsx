import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Building2,
  FileText,
  Loader2,
  Package,
  User,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../../api/axios";


import {
  useAuth,
} from "../../context/AuthContext";


interface ChallanItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: string | number;
  quantity: number;
}

interface ChallanData {
  id: string;
  challanNumber: string;
  totalQuantity: number;

  status:
    | "DRAFT"
    | "CONFIRMED"
    | "CANCELLED";

  createdAt: string;

  customer: {
    id: string;
    name: string;
    businessName: string;
    mobile?: string;
    address?: string;
  };

  creator?: {
    id: string;
    name: string;
    role: string;
  };

  items: ChallanItem[];
}

const ChallanDetail = () => {
  const { id } = useParams();

  const [challan, setChallan] =
    useState<ChallanData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


    const [confirming, setConfirming] =
  useState(false);

const [success, setSuccess] =
  useState("");


  const fetchChallan = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          `/challans/${id}`
        );

      setChallan(
        response.data.data
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load challan"
      );
    } finally {
      setLoading(false);
    }
  };


const handleConfirm = async () => {
  const shouldConfirm =
    window.confirm(
      "Are you sure you want to confirm this challan? Stock will be deducted and this action cannot be reversed."
    );

  if (!shouldConfirm) {
    return;
  }

  try {
    setConfirming(true);
    setError("");
    setSuccess("");

    const response =
      await api.patch(
        `/challans/${id}/confirm`
      );

    setSuccess(
      response.data.message ||
        "Challan confirmed successfully"
    );

    await fetchChallan();
  } catch (err: any) {
    setError(
      err.response?.data?.message ||
        "Failed to confirm challan"
    );
  } finally {
    setConfirming(false);
  }
};



  useEffect(() => {
    fetchChallan();
  }, [id]);

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

  if (!challan) {
    return (
      <div>
        <Link
          to="/challans"
          className="inline-flex items-center gap-2 text-sm text-slate-500 mb-5"
        >
          <ArrowLeft size={17} />
          Back to Challans
        </Link>

        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error || "Challan not found"}
        </div>
      </div>
    );
  }

  const estimatedValue =
    challan.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.unitPriceSnapshot
        ) *
          item.quantity,
      0
    );
const { hasRole } =
  useAuth();


  return (
    <div>
      <Link
        to="/challans"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-5"
      >
        <ArrowLeft size={17} />

        Back to Challans
      </Link>

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {challan.challanNumber}
            </h1>

            <StatusBadge
              status={
                challan.status
              }
            />
          </div>

          <p className="text-slate-500 mt-1">
            Created{" "}
            {new Date(
              challan.createdAt
            ).toLocaleString()}
          </p>
        </div>

{challan.status === "DRAFT" &&
  hasRole([
    "ADMIN",
    "SALES",
  ]) && (
  <button
    onClick={handleConfirm}
    disabled={confirming}
    className="
      inline-flex
      items-center
      justify-center
      gap-2
      bg-green-600
      hover:bg-green-700
      disabled:opacity-60
      text-white
      px-5 py-2.5
      rounded-lg
      text-sm
      font-medium
    "
  >
    {confirming && (
      <Loader2
        size={17}
        className="animate-spin"
      />
    )}

    {confirming
      ? "Confirming..."
      : "Confirm Challan"}
  </button>
)}


      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

{success && (
  <div className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
    {success}
  </div>
)}
      {/* Summary */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          icon={Building2}
          label="Customer"
          value={
            challan.customer
              .name
          }
          subValue={
            challan.customer
              .businessName
          }
        />

        <SummaryCard
          icon={Package}
          label="Total Quantity"
          value={String(
            challan.totalQuantity
          )}
          subValue={`${challan.items.length} product line(s)`}
        />

        <SummaryCard
          icon={FileText}
          label="Estimated Value"
          value={`₹${estimatedValue.toLocaleString(
            "en-IN",
            {
              minimumFractionDigits:
                2,
            }
          )}`}
          subValue="Based on product snapshot prices"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Products */}

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Challan Items
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Product information captured
              when the challan was created.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <th className="px-5 py-3">
                    Product
                  </th>

                  <th className="px-5 py-3">
                    SKU
                  </th>

                  <th className="px-5 py-3 text-right">
                    Unit Price
                  </th>

                  <th className="px-5 py-3 text-right">
                    Quantity
                  </th>

                  <th className="px-5 py-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {challan.items.map(
                  (item) => {
                    const amount =
                      Number(
                        item.unitPriceSnapshot
                      ) *
                      item.quantity;

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4 font-medium text-sm">
                          {
                            item.productNameSnapshot
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {
                            item.skuSnapshot
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-right">
                          ₹
                          {Number(
                            item.unitPriceSnapshot
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-right">
                          {
                            item.quantity
                          }
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-right">
                          ₹
                          {amount.toLocaleString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-slate-500">
                Total Estimated Value
              </p>

              <p className="text-xl font-bold mt-1">
                ₹
                {estimatedValue.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits:
                      2,
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Metadata */}

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="font-semibold">
              Customer Details
            </h2>

            <div className="mt-4 space-y-4">
              <Info
                label="Customer"
                value={
                  challan.customer
                    .name
                }
              />

              <Info
                label="Business"
                value={
                  challan.customer
                    .businessName
                }
              />

              {challan.customer
                .mobile && (
                <Info
                  label="Mobile"
                  value={
                    challan.customer
                      .mobile
                  }
                />
              )}

              {challan.customer
                .address && (
                <Info
                  label="Address"
                  value={
                    challan.customer
                      .address
                  }
                />
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2">
              <User
                size={18}
                className="text-slate-500"
              />

              <h2 className="font-semibold">
                Audit Information
              </h2>
            </div>

            <div className="mt-4 space-y-4">
              <Info
                label="Created By"
                value={
                  challan.creator
                    ?.name ||
                  "User"
                }
              />

              <Info
                label="Role"
                value={
                  challan.creator
                    ?.role ||
                  "—"
                }
              />

              <Info
                label="Created At"
                value={new Date(
                  challan.createdAt
                ).toLocaleString()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue: string;
}) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex gap-4">
    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
      <Icon size={20} />
    </div>

    <div>
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="font-bold text-slate-900 mt-1">
        {value}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        {subValue}
      </p>
    </div>
  </div>
);

const Info = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <p className="text-xs text-slate-500">
      {label}
    </p>

    <p className="text-sm font-medium mt-1">
      {value}
    </p>
  </div>
);

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
        px-3 py-1
        rounded-full
        text-xs font-semibold
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

export default ChallanDetail;