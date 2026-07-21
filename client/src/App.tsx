import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Customers
import Customers from "./pages/customers/Customers";
import CustomerForm from "./pages/customers/CustomerForm";
import CustomerDetail from "./pages/customers/CustomerDetail";

// Products
import Products from "./pages/products/Products";
import ProductForm from "./pages/products/ProductForm";
import ProductDetail from "./pages/products/ProductDetail";
import Challans from "./pages/challans/Challans";
import CreateChallan from "./pages/challans/CreateChallan";

import ChallanDetail from "./pages/challans/ChallanDetail";
import RoleRoute from "./components/RoleRoute";


function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* =========================
          PROTECTED ERP ROUTES
      ========================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* =====================
            CUSTOMERS
        ====================== */}

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/customers/new"
          element={<CustomerForm />}
        />

        <Route
          path="/customers/:id"
          element={<CustomerDetail />}
        />

        <Route
          path="/customers/:id/edit"
          element={<CustomerForm />}
        />

        {/* =====================
            PRODUCTS
        ====================== */}

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
  path="/products/new"
  element={
    <RoleRoute
      allowedRoles={[
        "ADMIN",
        "WAREHOUSE",
      ]}
    >
      <ProductForm />
    </RoleRoute>
  }
/>

        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />

        <Route
  path="/products/:id/edit"
  element={
    <RoleRoute
      allowedRoles={[
        "ADMIN",
        "WAREHOUSE",
      ]}
    >
      <ProductForm />
    </RoleRoute>
  }
/>

        {/* Challan routes
            next yahin add karenge */}
        <Route
          path="/challans"
          element={<Challans />}
        />

        <Route
          path="/challans/new"
          element={<CreateChallan />}
        />


        <Route
          path="/challans/:id"
          element={<ChallanDetail />}
        />

      </Route>

      {/* =========================
          REDIRECTS
      ========================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;