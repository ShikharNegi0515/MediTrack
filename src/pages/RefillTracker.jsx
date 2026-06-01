import { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  where,
} from "firebase/firestore";
import { auth, db, onAuthReady } from "../firebase/firebase";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function daysUntil(dateStr) {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function Badge({ label, tone = "indigo" }) {
  const tones = {
    indigo: "bg-brand-100 text-brand-800",
    yellow: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    green: "bg-emerald-100 text-emerald-800",
    gray: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.gray}`}
    >
      {label}
    </span>
  );
}

export default function RefillTracker() {
  const [form, setForm] = useState({
    name: "",
    remaining: "",
    refillBy: "",
    pharmacy: "",
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const user = await onAuthReady();
      if (!user) {
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, "renewals"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setItems(list);
          setLoading(false);
        },
        (err) => {
          console.error("renewals onSnapshot error:", err);
          setLoading(false);
        }
      );
    })();
    return () => unsub();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser || (await onAuthReady());
    if (!user) return;

    const payload = {
      userId: user.uid,
      name: form.name.trim(),
      remaining: Number(form.remaining || 0),
      refillBy: form.refillBy,
      pharmacy: form.pharmacy.trim(),
      status: "ok",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "renewals"), payload);
      setForm({ name: "", remaining: "", refillBy: "", pharmacy: "" });
    } catch (err) {
      console.error("Error adding renewal:", err);
    }
  };

  const markRequested = async (id) => {
    await updateDoc(doc(db, "renewals", id), {
      status: "requested",
      requestedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const markApproved = async (id) => {
    await updateDoc(doc(db, "renewals", id), {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, "renewals", id));
  };

  const computed = useMemo(() => {
    return items.map((it) => {
      const daysLeft = it.refillBy ? daysUntil(it.refillBy) : null;
      let badge = { label: "OK", tone: "green" };

      if (it.status === "requested") badge = { label: "Pending", tone: "blue" };
      if (it.status === "approved") badge = { label: "Approved", tone: "green" };
      if (it.status === "denied") badge = { label: "Denied", tone: "red" };

      if (it.status === "ok" || it.status === "expiring" || it.status === "overdue") {
        if (typeof it.remaining === "number") {
          if (it.remaining <= 0) badge = { label: "Overdue", tone: "red" };
          else if (it.remaining <= 5) badge = { label: "Low supply", tone: "yellow" };
        }
        if (daysLeft !== null) {
          if (daysLeft < 0) badge = { label: "Overdue", tone: "red" };
          else if (daysLeft <= 3 && badge.tone !== "red") {
            badge = { label: "Refill soon", tone: "yellow" };
          }
        }
      }

      return { ...it, daysLeft, badge };
    });
  }, [items]);

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Refill tracker"
        subtitle="Monitor pill counts and prescription renewal dates"
        action={<Badge label={`${computed.length} tracked`} tone="indigo" />}
      />

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Add medication</h3>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Medication
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                className="input-field"
                placeholder="e.g. Atorvastatin 10mg"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Pills remaining
              </label>
              <input
                type="number"
                min="0"
                value={form.remaining}
                onChange={(e) => setForm((s) => ({ ...s, remaining: e.target.value }))}
                className="input-field"
                placeholder="7"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Refill by
              </label>
              <input
                type="date"
                value={form.refillBy}
                onChange={(e) => setForm((s) => ({ ...s, refillBy: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Pharmacy (optional)
              </label>
              <input
                type="text"
                value={form.pharmacy}
                onChange={(e) => setForm((s) => ({ ...s, pharmacy: e.target.value }))}
                className="input-field"
                placeholder="CityCare Pharmacy"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            + Add to tracker
          </button>
        </form>
      </Card>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Your renewals</h3>
        {loading ? (
          <LoadingSpinner />
        ) : computed.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Nothing tracked yet"
            description="Add medications above to monitor refills and low supply."
          />
        ) : (
          <div className="space-y-3">
            {computed.map((it) => (
              <div
                key={it.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{it.name}</p>
                    <Badge label={it.badge.label} tone={it.badge.tone} />
                  </div>
                  <p className="text-sm text-slate-600">
                    {typeof it.remaining === "number"
                      ? `${it.remaining} pill${it.remaining === 1 ? "" : "s"} left`
                      : null}
                    {it.refillBy
                      ? ` · Refill by ${new Date(it.refillBy).toLocaleDateString()}`
                      : ""}
                    {typeof it.daysLeft === "number"
                      ? ` (${it.daysLeft} day${it.daysLeft === 1 ? "" : "s"} left)`
                      : ""}
                  </p>
                  {it.pharmacy && (
                    <p className="text-xs text-slate-500">Pharmacy: {it.pharmacy}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {it.status !== "requested" && it.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => markRequested(it.id)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      Request renewal
                    </button>
                  )}
                  {it.status === "requested" && (
                    <button
                      type="button"
                      onClick={() => markApproved(it.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Mark approved
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
