import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  Edit,
  Loader2,
  Package,
  Warehouse,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../../api/axios";

import { useAuth } from "../../context/AuthContext";

interface Movement {
  id: string;
  quantity: number;
  type: "IN" | "OUT";
  reason: string;
  createdAt: string;

  creator?: {
    id: string;
    name: string;
    role: string;
  };
}

interface ProductDetailData {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: string | number;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
  createdAt: string;
}

const ProductDetail = () => {
    const { hasRole } = useAuth();
  const { id } = useParams();

  const [product, setProduct] =
    useState<ProductDetailData | null>(null);

  const [movements, setMovements] =
    useState<Movement[]>([]);

  const [type, setType] =
    useState<"IN" | "OUT">("IN");

  const [quantity, setQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productResponse,
        movementResponse,
      ] = await Promise.all([
        api.get(`/products/${id}`),

        api.get(
          `/products/${id}/movements`
        ),
      ]);

      setProduct(
        productResponse.data.data
      );

    //   setMovements(
    //     movementResponse.data.data ||
    //       []
    //   );

const movementData =
  movementResponse.data.data;

setMovements(
  Array.isArray(movementData)
    ? movementData
    : movementData?.movements || []
);


    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStockMovement = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      setError(
        "Quantity must be greater than 0"
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post(
        `/products/${id}/stock`,
        {
          quantity: qty,
          type,
          reason: reason.trim(),
        }
      );

      setQuantity("");
      setReason("");

      await fetchData();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Stock update failed"
      );
    } finally {
      setSaving(false);
    }
  };

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

  if (!product) {
    return (
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-slate-500 mb-5"
        >
          <ArrowLeft size={17} />
          Back to Products
        </Link>

        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  const isLowStock =
    product.currentStock <=
    product.minimumStock;

  return (
    <div>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-5"
      >
        <ArrowLeft size={17} />
        Back to Products
      </Link>

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            <span
              className={`
                px-2.5 py-1
                rounded-full
                text-xs font-medium
                ${
                  isLowStock
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
                }
              `}
            >
              {isLowStock
                ? "LOW STOCK"
                : "IN STOCK"}
            </span>
          </div>

          <p className="text-slate-500 mt-1">
            SKU: {product.sku}
          </p>
        </div>

{hasRole(["ADMIN", "WAREHOUSE"]) && (
        <Link
          to={`/products/${id}/edit`}
          className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Edit size={17} />
          Edit Product
        </Link>
)}

      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Stat
          label="Current Stock"
          value={String(
            product.currentStock
          )}
        />

        <Stat
          label="Minimum Stock"
          value={String(
            product.minimumStock
          )}
        />

        <Stat
          label="Unit Price"
          value={`₹${Number(
            product.unitPrice
          ).toLocaleString("en-IN")}`}
        />

        <Stat
          label="Category"
          value={product.category}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Movement history */}

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-semibold">
              Stock Movement History
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Complete inventory audit trail
            </p>
          </div>

          {movements.length === 0 ? (
            <div className="py-14 text-center">
              <Package
                size={36}
                className="mx-auto text-slate-300"
              />

              <p className="text-sm text-slate-500 mt-3">
                No stock movements yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-162.5">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase text-left">
                    <th className="px-5 py-3">
                      Type
                    </th>

                    <th className="px-5 py-3">
                      Quantity
                    </th>

                    <th className="px-5 py-3">
                      Reason
                    </th>

                    <th className="px-5 py-3">
                      Created By
                    </th>

                    <th className="px-5 py-3">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {movements.map(
                    (movement) => (
                      <tr
                        key={movement.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex
                              items-center gap-1.5
                              px-2.5 py-1
                              rounded-full
                              text-xs font-medium
                              ${
                                movement.type ===
                                "IN"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                          >
                            {movement.type ===
                            "IN" ? (
                              <ArrowDownToLine
                                size={13}
                              />
                            ) : (
                              <ArrowUpFromLine
                                size={13}
                              />
                            )}

                            {movement.type}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {
                            movement.quantity
                          }
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {
                            movement.reason
                          }
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {movement.creator
                            ?.name ||
                            "User"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {new Date(
                            movement.createdAt
                          ).toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock update */}

        <div className="space-y-6">

{hasRole(["ADMIN", "WAREHOUSE"]) && (

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-semibold">
                Update Stock
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Record inventory movement
              </p>
            </div>

            <form
              onSubmit={
                handleStockMovement
              }
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Movement Type
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setType("IN")
                    }
                    className={`
                      py-2.5
                      rounded-lg
                      border
                      text-sm
                      font-medium
                      ${
                        type === "IN"
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "border-slate-300"
                      }
                    `}
                  >
                    Stock IN
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setType("OUT")
                    }
                    className={`
                      py-2.5
                      rounded-lg
                      border
                      text-sm
                      font-medium
                      ${
                        type === "OUT"
                          ? "bg-red-50 border-red-500 text-red-700"
                          : "border-slate-300"
                      }
                    `}
                  >
                    Stock OUT
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason
                </label>

                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                  placeholder={
                    type === "IN"
                      ? "Purchase received..."
                      : "Damaged / adjustment..."
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2"
              >
                {saving && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Updating..."
                  : `Record Stock ${type}`}
              </button>
            </form>
          </div>

                )}


          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex gap-3">
              <Warehouse
                className="text-slate-500 shrink-0"
                size={20}
              />

              <div>
                <p className="text-xs text-slate-500">
                  Warehouse / Location
                </p>

                <p className="font-medium text-sm mt-1">
                  {product.warehouse}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
    <p className="text-sm text-slate-500">
      {label}
    </p>

    <p className="text-xl font-bold text-slate-900 mt-2">
      {value}
    </p>
  </div>
);

export default ProductDetail;