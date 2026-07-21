import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../../api/axios";

interface Customer {
  id: string;
  name: string;
  businessName: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unitPrice: string | number;
}

interface Row {
  productId: string;
  quantity: number;
}

const CreateChallan = () => {
  const navigate =
    useNavigate();

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [customerId, setCustomerId] =
    useState("");

  const [items, setItems] =
    useState<Row[]>([
      {
        productId: "",
        quantity: 1,
      },
    ]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        customerResponse,
        productResponse,
      ] = await Promise.all([
        api.get(
          "/customers?limit=100"
        ),

        api.get(
          "/products?limit=100"
        ),
      ]);

      const customerData =
        customerResponse.data.data;

      const productData =
        productResponse.data.data;

      setCustomers(
        Array.isArray(customerData)
          ? customerData
          : customerData?.customers ||
              []
      );

      setProducts(
        Array.isArray(productData)
          ? productData
          : productData?.products ||
              []
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load form data"
      );
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        quantity: 1,
      },
    ]);
  };

  const removeRow = (
    index: number
  ) => {
    if (items.length === 1)
      return;

    setItems((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  const updateRow = (
    index: number,
    field: keyof Row,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const totalQuantity =
    useMemo(
      () =>
        items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.quantity || 0
            ),
          0
        ),
      [items]
    );

  const handleSubmit = async (
    status:
      | "DRAFT"
      | "CONFIRMED"
  ) => {
    try {
      setError("");

      if (!customerId) {
        setError(
          "Please select a customer"
        );
        return;
      }

      const validItems =
        items.filter(
          (item) =>
            item.productId &&
            Number(
              item.quantity
            ) > 0
        );

      if (
        validItems.length === 0
      ) {
        setError(
          "Add at least one valid product"
        );
        return;
      }

      const duplicateIds =
        validItems.map(
          (item) =>
            item.productId
        );

      if (
        new Set(duplicateIds)
          .size !==
        duplicateIds.length
      ) {
        setError(
          "Same product cannot be added twice"
        );
        return;
      }

      setSaving(true);

      const response =
        await api.post(
          "/challans",
          {
            customerId,

            status,

            items:
              validItems.map(
                (item) => ({
                  productId:
                    item.productId,

                  quantity:
                    Number(
                      item.quantity
                    ),
                })
              ),
          }
        );

      const created =
        response.data.data;

      if (created?.id) {
        navigate(
          `/challans/${created.id}`
        );
      } else {
        navigate("/challans");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create challan"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2
          size={30}
          className="animate-spin text-blue-600"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to="/challans"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-5"
      >
        <ArrowLeft size={17} />

        Back to Challans
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Create Sales Challan
        </h1>

        <p className="text-slate-500 mt-1">
          Select a customer and add
          products for dispatch.
        </p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* Customer */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">
            Customer
          </h2>

          <select
            value={customerId}
            onChange={(e) =>
              setCustomerId(
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Select customer
            </option>

            {customers.map(
              (customer) => (
                <option
                  key={
                    customer.id
                  }
                  value={
                    customer.id
                  }
                >
                  {customer.name} —{" "}
                  {
                    customer.businessName
                  }
                </option>
              )
            )}
          </select>
        </div>

        {/* Products */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="font-semibold">
                Products
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Add one or multiple
                products.
              </p>
            </div>

            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              <Plus size={16} />

              Add Row
            </button>
          </div>

          <div className="p-5 space-y-4">
            {items.map(
              (item, index) => {
                const selected =
                  products.find(
                    (product) =>
                      product.id ===
                      item.productId
                  );

                const insufficient =
                  selected &&
                  Number(
                    item.quantity
                  ) >
                    selected.currentStock;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[1fr_160px_100px] gap-3 items-start"
                  >
                    <div>
                      <select
                        value={
                          item.productId
                        }
                        onChange={(
                          e
                        ) =>
                          updateRow(
                            index,
                            "productId",
                            e.target
                              .value
                          )
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
                      >
                        <option value="">
                          Select product
                        </option>

                        {products.map(
                          (
                            product
                          ) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                            >
                              {
                                product.name
                              }{" "}
                              (
                              {
                                product.sku
                              }
                              )
                            </option>
                          )
                        )}
                      </select>

                      {selected && (
                        <p
                          className={`text-xs mt-1 ${
                            insufficient
                              ? "text-red-600"
                              : "text-slate-500"
                          }`}
                        >
                          Available:{" "}
                          {
                            selected.currentStock
                          }{" "}
                          | ₹
                          {Number(
                            selected.unitPrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="number"
                        min="1"
                        value={
                          item.quantity
                        }
                        onChange={(
                          e
                        ) =>
                          updateRow(
                            index,
                            "quantity",
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                        className={`
                          w-full border
                          rounded-lg
                          px-3 py-2.5
                          ${
                            insufficient
                              ? "border-red-500"
                              : "border-slate-300"
                          }
                        `}
                      />

                      <p className="text-xs text-slate-500 mt-1">
                        Quantity
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        items.length ===
                        1
                      }
                      onClick={() =>
                        removeRow(
                          index
                        )
                      }
                      className="h-10.5 flex items-center justify-center border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-30"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>
                  </div>
                );
              }
            )}
          </div>

          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
            <span className="text-sm text-slate-500">
              Total Quantity
            </span>

            <span className="font-bold">
              {totalQuantity}
            </span>
          </div>
        </div>

        {/* Actions */}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            disabled={saving}
            onClick={() =>
              handleSubmit("DRAFT")
            }
            className="px-5 py-2.5 border border-slate-300 rounded-lg font-medium text-sm hover:bg-white disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            disabled={saving}
            onClick={() =>
              handleSubmit(
                "CONFIRMED"
              )
            }
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 inline-flex justify-center items-center gap-2"
          >
            {saving && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            Confirm Challan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChallan;