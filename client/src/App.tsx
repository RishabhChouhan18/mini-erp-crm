import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import AppLayout from "./components/layout/AppLayout";

import Customers from "./pages/customers/Customers";

import CustomerForm from "./pages/customers/CustomerForm";

import CustomerDetail from "./pages/customers/CustomerDetail";
function App() {
  return (
    <Routes>
      {/* Public */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* Protected ERP */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Customer/Product/Challan routes
            next steps mein yahan add honge */}

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/customers/new"
          element={<CustomerForm />}
        />
      </Route>

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

<Route
  path="/customers/:id"
  element={<CustomerDetail />}
/>

<Route
  path="/customers/:id/edit"
  element={<CustomerForm />}
/>

    </Routes>
  );
}

export default App;