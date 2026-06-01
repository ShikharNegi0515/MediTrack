import { useState, useEffect } from "react";
import axios from "axios";
import { onAuthReady } from "../firebase/firebase";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const FIREBASE_BASE =
  "https://meditrack-a9867-default-rtdb.asia-southeast1.firebasedatabase.app";
const MEDICATIONS_URL = `${FIREBASE_BASE}/medications`;
const HISTORY_URL = `${FIREBASE_BASE}/history`;

function Medication() {
  const [medication, setMedication] = useState({
    name: "",
    dose: 1,
    time: "",
    frequency: "daily",
  });
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await onAuthReady();
      if (user) {
        setUserId(user.uid);
        await fetchMedications(user.uid);
      }
      setLoading(false);
    })();
  }, []);

  const fetchMedications = async (uid) => {
    try {
      const res = await axios.get(`${MEDICATIONS_URL}.json`);
      if (res.data) {
        const loadedMeds = Object.entries(res.data)
          .map(([id, med]) => ({ id, ...med }))
          .filter((m) => m.userId === uid);
        setMedications(loadedMeds);
      } else {
        setMedications([]);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  const handleChange = (e) => {
    setMedication({ ...medication, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const newMed = {
        ...medication,
        dose: Number(medication.dose),
        status: "pending",
        userId,
        counters: { taken: 0, missed: 0 },
      };
      const res = await axios.post(`${MEDICATIONS_URL}.json`, newMed);
      if (res.data?.name) {
        setMedications((prev) => [...prev, { id: res.data.name, ...newMed }]);
        setMedication({ name: "", dose: 1, time: "", frequency: "daily" });
      }
    } catch (error) {
      console.error("Error saving medication:", error);
    }
  };

  const updateStatus = async (id, newStatus, med) => {
    try {
      const prevStatus = med.status || "pending";
      if (prevStatus === newStatus) return;

      const countersRes = await axios.get(`${MEDICATIONS_URL}/${id}/counters.json`);
      let counters = countersRes.data || { taken: 0, missed: 0 };

      if (prevStatus === "pending") {
        if (newStatus === "taken") {
          counters = { taken: 1, missed: 0 };
        } else if (newStatus === "missed") {
          counters = { taken: 0, missed: 1 };
        }
      } else if (prevStatus === "taken" && newStatus === "missed") {
        counters = { taken: 0, missed: 1 };
      } else if (prevStatus === "missed" && newStatus === "taken") {
        counters = { taken: 1, missed: 0 };
      }

      await axios.patch(`${MEDICATIONS_URL}/${id}.json`, { status: newStatus, counters });

      setMedications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus, counters } : m))
      );

      const date = new Date().toISOString().split("T")[0];
      await axios.post(`${HISTORY_URL}.json`, {
        medId: id,
        medName: med.name,
        dose: med.dose,
        time: med.time,
        frequency: med.frequency,
        status: newStatus,
        date,
        userId,
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const removeMedication = async (id) => {
    try {
      await axios.delete(`${MEDICATIONS_URL}/${id}.json`);
      setMedications((prev) => prev.filter((med) => med.id !== id));
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  const statusStyles = {
    taken: "border-emerald-200 bg-emerald-50/80",
    missed: "border-red-200 bg-red-50/80",
    pending: "border-slate-200 bg-white hover:border-brand-200 hover:shadow-md",
  };

  if (loading) {
    return <LoadingSpinner label="Loading medications..." />;
  }

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Medications"
        subtitle="Add prescriptions and mark doses as taken or missed"
      />

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Add medication</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Metformin"
                value={medication.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Dose</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setMedication((prev) => ({
                      ...prev,
                      dose: prev.dose > 1 ? prev.dose - 1 : 1,
                    }))
                  }
                  className="btn-secondary !px-3 !py-2"
                  aria-label="Decrease dose"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-lg font-semibold text-brand-700">
                  {medication.dose}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMedication((prev) => ({ ...prev, dose: Number(prev.dose) + 1 }))
                  }
                  className="btn-secondary !px-3 !py-2"
                  aria-label="Increase dose"
                >
                  +
                </button>
                <span className="text-sm text-slate-500">pill(s)</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Time</label>
              <input
                type="time"
                name="time"
                value={medication.time}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Frequency</label>
              <select
                name="frequency"
                value={medication.frequency}
                onChange={handleChange}
                className="input-field"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <button type="submit" className="btn-primary w-full">
              Add medication
            </button>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <h3 className="text-lg font-semibold text-slate-800">
            Your list ({medications.length})
          </h3>

          {medications.length === 0 ? (
            <EmptyState
              icon="💊"
              title="No medications yet"
              description="Add your first medication using the form on the left."
            />
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className={`flex flex-col gap-4 rounded-2xl border p-4 shadow-sm transition sm:flex-row sm:items-center sm:justify-between ${statusStyles[med.status] || statusStyles.pending}`}
                >
                  <div>
                    <p className="text-lg font-semibold capitalize text-slate-900">{med.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-medium text-brand-800">
                        {med.dose} pill{med.dose > 1 ? "s" : ""}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700">
                        {med.time}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium capitalize text-emerald-800">
                        {med.frequency}
                      </span>
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${
                          med.status === "taken"
                            ? "bg-emerald-200 text-emerald-900"
                            : med.status === "missed"
                              ? "bg-red-200 text-red-900"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {med.status || "pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(med.id, "taken", med)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Taken
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(med.id, "missed", med)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                    >
                      Missed
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMedication(med.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Medication;
