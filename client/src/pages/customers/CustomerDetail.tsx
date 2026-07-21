import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarClock,
  Edit,
  Loader2,
  MessageSquarePlus,
  Phone,
  Mail,
  Building2,
  MapPin,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../../api/axios";

interface FollowUp {
  id: string;
  note: string;
  createdAt: string;

  creator?: {
    id: string;
    name: string;
    role: string;
  };
}

interface CustomerDetailData {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string;
  gstNumber: string | null;
  customerType: string;
  address: string;
  status: string;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  followUps: FollowUp[];
}

const CustomerDetail = () => {
  const { id } = useParams();

  const [customer, setCustomer] =
    useState<CustomerDetailData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [note, setNote] =
    useState("");

  const [followUpDate, setFollowUpDate] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          `/customers/${id}`
        );

      setCustomer(
        response.data.data
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load customer"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleFollowUp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!note.trim()) return;

    try {
      setSaving(true);
      setError("");

      await api.post(
        `/customers/${id}/followups`,
        {
          note: note.trim(),

          ...(followUpDate && {
            followUpDate:
              new Date(
                followUpDate
              ).toISOString(),
          }),
        }
      );

      setNote("");
      setFollowUpDate("");

      await fetchCustomer();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to add follow-up"
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

  if (error && !customer) {
    return (
      <div>
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 mb-5"
        >
          <ArrowLeft size={17} />
          Back to Customers
        </Link>

        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div>
      {/* Top */}

      <div className="mb-6">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-5"
        >
          <ArrowLeft size={17} />
          Back to Customers
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {customer.name}
              </h1>

              <StatusBadge
                status={
                  customer.status
                }
              />
            </div>

            <p className="text-slate-500 mt-1">
              {customer.businessName}
            </p>
          </div>

          <Link
            to={`/customers/${customer.id}/edit`}
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            <Edit size={17} />
            Edit Customer
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left */}

        <div className="xl:col-span-2 space-y-6">

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-semibold">
                Customer Information
              </h2>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

              <Info
                icon={Building2}
                label="Business"
                value={
                  customer.businessName
                }
              />

              <Info
                icon={Phone}
                label="Mobile"
                value={
                  customer.mobile
                }
              />

              <Info
                icon={Mail}
                label="Email"
                value={
                  customer.email ||
                  "Not provided"
                }
              />

              <Info
                icon={Building2}
                label="Customer Type"
                value={
                  customer.customerType
                }
              />

              <Info
                icon={Building2}
                label="GST Number"
                value={
                  customer.gstNumber ||
                  "Not provided"
                }
              />

              <Info
                icon={CalendarClock}
                label="Next Follow-up"
                value={
                  customer.followUpDate
                    ? new Date(
                        customer.followUpDate
                      ).toLocaleDateString()
                    : "Not scheduled"
                }
              />

              <div className="md:col-span-2">
                <Info
                  icon={MapPin}
                  label="Address"
                  value={
                    customer.address
                  }
                />
              </div>
            </div>
          </div>

          {/* Follow-up history */}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-semibold">
                Follow-up History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                CRM interaction timeline
              </p>
            </div>

            {customer.followUps?.length ===
            0 ? (
              <div className="p-10 text-center">
                <CalendarClock
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="text-slate-500 mt-3 text-sm">
                  No follow-ups added yet.
                </p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {customer.followUps?.map(
                  (followUp) => (
                    <div
                      key={
                        followUp.id
                      }
                      className="relative pl-6 border-l-2 border-blue-100 pb-5 last:pb-0"
                    >
                      <div className="absolute -left-1.75 top-1 w-3 h-3 rounded-full bg-blue-600" />

                      <p className="text-sm text-slate-800 whitespace-pre-wrap">
                        {
                          followUp.note
                        }
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>
                          {followUp.creator
                            ?.name ||
                            "User"}
                        </span>

                        <span>•</span>

                        <span>
                          {new Date(
                            followUp.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right */}

        <div className="space-y-6">

          {/* Add follow-up */}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-5 border-b border-slate-200 flex items-center gap-3">
              <MessageSquarePlus
                size={20}
                className="text-blue-600"
              />

              <h2 className="font-semibold">
                Add Follow-up
              </h2>
            </div>

            <form
              onSubmit={
                handleFollowUp
              }
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Follow-up Note
                </label>

                <textarea
                  value={note}
                  onChange={(e) =>
                    setNote(
                      e.target.value
                    )
                  }
                  required
                  rows={5}
                  placeholder="Discussed pricing, call again next week..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Next Follow-up Date
                </label>

                <input
                  type="date"
                  value={
                    followUpDate
                  }
                  onChange={(e) =>
                    setFollowUpDate(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={
                  saving ||
                  !note.trim()
                }
                className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                {saving && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Adding..."
                  : "Add Follow-up"}
              </button>
            </form>
          </div>

          {/* Initial notes */}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold">
              Customer Notes
            </h3>

            <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">
              {customer.notes ||
                "No notes available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex gap-3">
    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
      <Icon size={17} />
    </div>

    <div>
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="text-sm font-medium text-slate-900 mt-1">
        {value}
      </p>
    </div>
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
    ACTIVE:
      "bg-green-100 text-green-700",
    LEAD:
      "bg-blue-100 text-blue-700",
    INACTIVE:
      "bg-slate-200 text-slate-600",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
};

export default CustomerDetail;