import { useState, useEffect } from "react";
import axios from "axios";
import { onAuthReady } from "../firebase/firebase";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const HISTORY_URL =
  "https://meditrack-a9867-default-rtdb.asia-southeast1.firebasedatabase.app/history";

function MedicationHistory() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState({ status: "", name: "" });
  const [expandedDates, setExpandedDates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await onAuthReady();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${HISTORY_URL}.json`);
        if (!res.data) {
          setEntries([]);
          setLoading(false);
          return;
        }

        const loaded = Object.entries(res.data)
          .map(([id, entry]) => ({ id, ...entry }))
          .filter((e) => e.userId === user.uid)
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setEntries(loaded);
        const dates = [...new Set(loaded.map((e) => e.date))];
        setExpandedDates(Object.fromEntries(dates.slice(0, 1).map((d) => [d, true])));
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function filteredEntries() {
    return entries.filter(
      (e) =>
        (filter.status === "" || e.status === filter.status) &&
        (filter.name === "" ||
          (e.medName || "").toLowerCase().includes(filter.name.toLowerCase()))
    );
  }

  const groupedByDate = filteredEntries().reduce((acc, entry) => {
    const date = entry.date || "Unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  function toggleDate(date) {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  }

  if (loading) return <LoadingSpinner label="Loading history..." />;

  return (
    <div className="page-container animate-slide-up">
      <PageHeader title="History" subtitle="A timeline of your logged doses" />

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by medication..."
          value={filter.name}
          onChange={(e) => setFilter({ ...filter, name: e.target.value })}
          className="input-field max-w-xs"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="input-field max-w-[180px]"
        >
          <option value="">All statuses</option>
          <option value="taken">Taken</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      {Object.keys(groupedByDate).length === 0 ? (
        <EmptyState
          icon="📜"
          title="No history yet"
          description="When you mark doses as taken or missed, they will appear here."
        />
      ) : (
        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div
              key={date}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left font-semibold text-brand-800 transition hover:bg-brand-50"
                onClick={() => toggleDate(date)}
              >
                <span>{date}</span>
                <span className="text-brand-600">{expandedDates[date] ? "−" : "+"}</span>
              </button>
              {expandedDates[date] && (
                <div className="space-y-2 border-t border-slate-100 p-4">
                  {items.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between rounded-xl border-l-4 p-3 ${
                        entry.status === "taken"
                          ? "border-emerald-500 bg-emerald-50/60"
                          : "border-red-500 bg-red-50/60"
                      }`}
                    >
                      <div>
                        <p className="font-semibold capitalize text-slate-900">
                          {entry.medName}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {entry.dose} pill{entry.dose > 1 ? "s" : ""} at {entry.time}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          entry.status === "taken"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicationHistory;
