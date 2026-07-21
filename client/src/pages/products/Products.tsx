import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  Loader2,
  Package,
  Plus,
  Search,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import api from "../../api/axios";

import type {
  Product,
} from "../../types/product";


import { useAuth } from "../../context/AuthContext";


  

  

const Products = () => {
    const { hasRole } = useAuth();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [total, setTotal] =
    useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/products", {
          params: {
            page: 1,
            limit: 50,

            ...(search && {
              search,
            }),

            ...(category && {
              category,
            }),
          },
        });

      const responseData =
        response.data;

      setProducts(
        responseData.data || []
      );

      setTotal(
        responseData.pagination
          ?.total ||
          responseData.data?.length ||
          0
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    ...new Set(
      products
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean)
    ),
  ];

  return (
    <div>

<Link
      to="/dashboard"
      className="
        inline-flex
        items-center
        gap-2
        text-sm
        text-slate-500
        hover:text-slate-900
        mb-5
        transition
      "
    >
      <ArrowLeft size={17} />
      Back to Dashboard
    </Link>


      {/* Header */}

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
            Products & Inventory
          </h1>

          <p className="text-slate-500 mt-1">
            Manage products, stock levels
            and warehouse inventory.
          </p>
        </div>

     {hasRole(["ADMIN", "WAREHOUSE"]) && (
  <Link
    to="/products/new"
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
    Add Product
  </Link>
)}
      </div>

      {/* Filters */}

      <div className="
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        p-4
        mb-5
      ">
        <div className="
          flex flex-col
          md:flex-row
          gap-3
        ">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by product name, SKU or category..."
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
            value={category}
            onChange={(e) =>
              setCategory(
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
              All Categories
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
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
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">
            Inventory Directory
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {total} product
            {total !== 1 && "s"} found
          </p>
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
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package
              size={42}
              className="mx-auto text-slate-300"
            />

            <p className="font-medium text-slate-700 mt-4">
              No products found
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Add your first product to
              start managing inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225">
              <thead>
                <tr className="
                  bg-slate-50
                  border-b border-slate-200
                  text-left
                  text-xs uppercase
                  tracking-wide
                  text-slate-500
                ">
                  <th className="px-5 py-3">
                    Product
                  </th>

                  <th className="px-5 py-3">
                    Category
                  </th>

                  <th className="px-5 py-3">
                    Unit Price
                  </th>

                  <th className="px-5 py-3">
                    Stock
                  </th>

                  <th className="px-5 py-3">
                    Warehouse
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map(
                  (product) => {
                    const isLowStock =
                      product.currentStock <=
                      product.minimumStock;

                    return (
                      <tr
                        key={product.id}
                        className="
                          border-b
                          border-slate-100
                          last:border-0
                          hover:bg-slate-50
                        "
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-sm text-slate-900">
                            {product.name}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            SKU:{" "}
                            {product.sku}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-700">
                            {
                              product.category
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium">
                          ₹
                          {Number(
                            product.unitPrice
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits:
                                2,
                            }
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p
                            className={`
                              text-sm
                              font-bold
                              ${
                                isLowStock
                                  ? "text-amber-700"
                                  : "text-slate-900"
                              }
                            `}
                          >
                            {
                              product.currentStock
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            Min:{" "}
                            {
                              product.minimumStock
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            product.warehouse
                          }
                        </td>

                        <td className="px-5 py-4">
                          {isLowStock ? (
                            <span className="
                              inline-flex
                              items-center
                              gap-1.5
                              px-2.5 py-1
                              bg-amber-100
                              text-amber-700
                              rounded-full
                              text-xs
                              font-medium
                            ">
                              <AlertTriangle
                                size={13}
                              />

                              Low Stock
                            </span>
                          ) : (
                            <span className="
                              inline-flex
                              px-2.5 py-1
                              bg-green-100
                              text-green-700
                              rounded-full
                              text-xs
                              font-medium
                            ">
                              In Stock
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/products/${product.id}`}
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

                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;