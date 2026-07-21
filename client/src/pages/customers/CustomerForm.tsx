import {
  useState,
} from "react";

import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../../api/axios";

import type {
  CustomerFormData,
} from "../../types/customer";

const CustomerForm = () => {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState<CustomerFormData>({
      name: "",
      mobile: "",
      email: "",
      businessName: "",
      gstNumber: "",
      customerType: "RETAIL",
      address: "",
      status: "LEAD",
      followUpDate: "",
      notes: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
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
        ...form,

        email:
          form.email || undefined,

        gstNumber:
          form.gstNumber || undefined,

        followUpDate:
          form.followUpDate
            ? new Date(
                form.followUpDate
              ).toISOString()
            : undefined,

        notes:
          form.notes || undefined,
      };

      await api.post(
        "/customers",
        payload
      );

      navigate("/customers");
    } catch (err: any) {
      const response =
        err.response?.data;

      setError(
        response?.message ||
          "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/customers"
        className="
          inline-flex
          items-center gap-2
          text-sm
          text-slate-500
          hover:text-slate-900
          mb-5
        "
      >
        <ArrowLeft size={17} />

        Back to Customers
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Add Customer
        </h1>

        <p className="text-slate-500 mt-1">
          Create a new customer or CRM lead.
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

        {/* Business Information */}

        <FormSection
          title="Customer Information"
          description="Basic customer and business details."
        >
          <Input
            label="Customer Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Business Name"
            name="businessName"
            value={
              form.businessName
            }
            onChange={handleChange}
            required
          />

          <Input
            label="Mobile Number"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="GST Number"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            placeholder="Optional"
          />

          <div>
            <Label>
              Customer Type
            </Label>

            <select
              name="customerType"
              value={
                form.customerType
              }
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="RETAIL">
                Retail
              </option>

              <option value="WHOLESALE">
                Wholesale
              </option>

              <option value="DISTRIBUTOR">
                Distributor
              </option>
            </select>
          </div>
        </FormSection>

        {/* CRM */}

        <FormSection
          title="CRM Details"
          description="Customer status and follow-up information."
        >
          <div>
            <Label>Status</Label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputStyle}
            >
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

          <Input
            label="Follow-up Date"
            name="followUpDate"
            type="date"
            value={
              form.followUpDate
            }
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <Label>Address</Label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              rows={3}
              className={inputStyle}
              placeholder="Full business/customer address"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Notes</Label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              className={inputStyle}
              placeholder="Add initial CRM notes..."
            />
          </div>
        </FormSection>

        {/* Actions */}

        <div className="
          px-6 py-4
          bg-slate-50
          border-t border-slate-200
          flex
          justify-end
          gap-3
        ">
          <Link
            to="/customers"
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
              : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle = `
  w-full
  border border-slate-300
  rounded-lg
  px-3 py-2.5
  outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
`;

const Label = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <label className="block text-sm font-medium text-slate-700 mb-2">
    {children}
  </label>
);

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({
  label,
  ...props
}: InputProps) => (
  <div>
    <Label>{label}</Label>

    <input
      {...props}
      className={inputStyle}
    />
  </div>
);

const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="
    p-6
    border-b
    border-slate-200
    last:border-0
  ">
    <div className="mb-5">
      <h2 className="font-semibold text-slate-900">
        {title}
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        {description}
      </p>
    </div>

    <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      gap-5
    ">
      {children}
    </div>
  </div>
);

export default CustomerForm;