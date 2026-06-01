import { useEffect, useMemo, useRef, useState } from "react";
import { auth, db, onAuthReady } from "../firebase/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function scheduleLocalNotification({ title, body, when }) {
  if (!("Notification" in window)) return () => {};

  const delay = when.getTime() - Date.now();
  if (delay <= 0) {
    try {
      new Notification(title, { body, icon: "/logo.png" });
    } catch {
      /* ignore */
    }
    return () => {};
  }

  const timerId = setTimeout(() => {
    try {
      new Notification(title, { body, icon: "/logo.png" });
    } catch {
      /* ignore */
    }
  }, delay);

  return () => clearTimeout(timerId);
}

function parseLocalDateTime(value) {
  if (!value) return null;
  const [date, time] = value.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export default function Reminders() {
  const [medication, setMedication] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const timersRef = useRef({});

  useEffect(() => {
    let unsubscribe = () => {};
    let mounted = true;

    (async () => {
      const user = await onAuthReady();
      if (!mounted || !user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "reminders"),
        where("userId", "==", user.uid),
        orderBy("time", "asc")
      );

      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setReminders(list);
          setLoading(false);
        },
        (err) => {
          console.error("onSnapshot error:", err);
          setLoading(false);
        }
      );
    })();

    return () => {
      mounted = false;
      unsubscribe();
      Object.values(timersRef.current).forEach((clearFn) => clearFn?.());
      timersRef.current = {};
    };
  }, []);

  useEffect(() => {
    Object.values(timersRef.current).forEach((clearFn) => clearFn?.());
    timersRef.current = {};

    reminders.forEach((r) => {
      const when = new Date(r.time);
      const clearFn = scheduleLocalNotification({
        title: "Medication Reminder",
        body: `Time to take ${r.medication}`,
        when,
      });
      timersRef.current[r.id] = clearFn;
    });
  }, [reminders]);

  const addReminder = async (e) => {
    e.preventDefault();
    if (!medication || !dateTime) return;

    const user = await onAuthReady();
    if (!user) return;

    const when = parseLocalDateTime(dateTime);
    if (!when) return;

    await addDoc(collection(db, "reminders"), {
      userId: user.uid,
      medication: medication.trim(),
      time: when.toISOString(),
      createdAt: new Date().toISOString(),
    });

    setMedication("");
    setDateTime("");
  };

  const deleteReminder = async (id) => {
    await deleteDoc(doc(db, "reminders", id));
  };

  const formattedReminders = useMemo(
    () =>
      reminders.map((r) => ({
        ...r,
        local: new Date(r.time).toLocaleString(),
        isPast: new Date(r.time) < new Date(),
      })),
    [reminders]
  );

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Reminders"
        subtitle="Schedule notifications so you never miss a dose"
      />

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Add a reminder</h3>
        <form onSubmit={addReminder} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Medication
              </label>
              <input
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                className="input-field"
                placeholder="e.g. Paracetamol"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Date & time
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Add reminder
          </button>
        </form>
      </Card>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Scheduled</h3>

        {loading ? (
          <LoadingSpinner />
        ) : formattedReminders.length === 0 ? (
          <EmptyState
            icon="⏰"
            title="No reminders scheduled"
            description="Add a reminder above to get notified when it's time for your medication."
          />
        ) : (
          <ul className="space-y-3">
            {formattedReminders.map((r) => (
              <li
                key={r.id}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 shadow-sm transition ${
                  r.isPast
                    ? "border-slate-200 bg-slate-50 opacity-75"
                    : "border-brand-100 bg-white hover:border-brand-200"
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-900">{r.medication}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{r.local}</p>
                  {r.isPast && (
                    <span className="mt-1 inline-block text-xs text-slate-400">Past</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteReminder(r.id)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
