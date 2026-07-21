import {
  useState,
  useEffect,
} from "react";

import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/axios";

import type {
  ProductFormData,
} from "../../types/product";

const ProductForm = () => {
  const navigate =
    useNavigate();

const { id } =
    useParams();

  const isEdit =
    Boolean(id);

  const [form, setForm] =
    useState<ProductFormData>({
      name: "",
      sku: "",
      category: "",
      unitPrice: "",
      currentStock: "0",
      minimumStock: "0",
      warehouse: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

useEffect(() => {
  if (!id) return;

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          `/products/${id}`
        );

      const product =
        response.data.data;

      setForm({
        name:
          product.name || "",

        sku:
          product.sku || "",

        category:
          product.category || "",

        unitPrice:
          String(
            product.unitPrice ?? ""
          ),

        currentStock:
          String(
            product.currentStock ?? 0
          ),

        minimumStock:
          String(
            product.minimumStock ?? 0
          ),

        warehouse:
          product.warehouse || "",
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        sku: form.sku
          .trim()
          .toUpperCase(),

        category:
          form.category.trim(),

        unitPrice: Number(
          form.unitPrice
        ),

        currentStock: Number(
          form.currentStock
        ),

        minimumStock: Number(
          form.minimumStock
        ),

        warehouse:
          form.warehouse.trim(),
      };

      if (isEdit) {
  await api.put(
    `/products/${id}`,
    payload
  );

  navigate(
    `/products/${id}`
  );
} else {
  await api.post(
    "/products",
    payload
  );

  navigate("/products");
}

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
     <Link
  to={
    isEdit
      ? `/products/${id}`
      : "/products"
  }
  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-5"
>
  <ArrowLeft size={17} />

  {isEdit
    ? "Back to Product"
    : "Back to Products"}
</Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
  {isEdit
    ? "Edit Product"
    : "Add Product"}
</h1>

<p className="text-slate-500 mt-1">
  {isEdit
    ? "Update product and inventory configuration."
    : "Add a product and configure its initial inventory information."}
</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          border border-slate-200
          rounded-xl
          shadow-sm
          overflow-hidden
        "
      >
        {error && (
          <div className="m-6 mb-0 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">
              Product Information
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Basic product, pricing and
              warehouse information.
            </p>
          </div>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          ">
            <Input
              label="Product Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Wireless Mouse"
              required
            />

            <Input
              label="SKU / Product Code"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="WM-001"
              required
            />

            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Electronics"
              required
            />

            <Input
              label="Unit Price (₹)"
              name="unitPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={handleChange}
              placeholder="799"
              required
            />

            <Input
              label="Initial Stock"
              name="currentStock"
              type="number"
              min="0"
              step="1"
              value={form.currentStock}
              onChange={handleChange}
              required
            />

            <Input
              label="Minimum Stock Alert"
              name="minimumStock"
              type="number"
              min="0"
              step="1"
              value={form.minimumStock}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <Input
                label="Warehouse / Location"
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                placeholder="Indore Main Warehouse - Rack A3"
                required
              />
            </div>
          </div>
        </div>

        <div className="
          px-6 py-4
          bg-slate-50
          border-t border-slate-200
          flex
          justify-end
          gap-3
        ">
          <Link
            to="/products"
            className="
              px-4 py-2.5
              border border-slate-300
              rounded-lg
              text-sm font-medium
              text-slate-700
              hover:bg-white
            "
          >
            Cancel
          </Link>

          <button
            disabled={loading}
            type="submit"
            className="
              inline-flex
              items-center gap-2
              bg-blue-600
              hover:bg-blue-700
              disabled:opacity-60
              text-white
              px-5 py-2.5
              rounded-lg
              text-sm font-medium
            "
          >
            {loading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {loading
  ? "Saving..."
  : isEdit
  ? "Update Product"
  : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({
  label,
  ...props
}: InputProps) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label}
    </label>

    <input
      {...props}
      className="
        w-full
        border border-slate-300
        rounded-lg
        px-3 py-2.5
        outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:border-blue-500
      "
    />
  </div>
);

export default ProductForm;