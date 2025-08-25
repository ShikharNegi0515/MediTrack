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

// --- helpers ---
function daysUntil(dateStr) {
    const today = new Date();
    const target = new Date(dateStr);
    const diff = target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function Badge({ label, tone = "indigo" }) {
    const tones = {
        indigo: "bg-indigo-100 text-indigo-700",
        yellow: "bg-yellow-100 text-yellow-700",
        red: "bg-red-100 text-red-700",
        green: "bg-green-100 text-green-700",
        gray: "bg-gray-100 text-gray-700",
        blue: "bg-blue-100 text-blue-700",
    };
    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone] || tones.gray
                }`}
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

    // realtime listener for this user's renewals
    useEffect(() => {
        let unsub = () => { };
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
        if (!user) return alert("Please log in.");

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
            alert("Failed to save renewal. Check console.");
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
                    else if (it.remaining <= 5) badge = { label: "Expiring Soon", tone: "yellow" };
                }
                if (daysLeft !== null) {
                    if (daysLeft < 0) badge = { label: "Overdue", tone: "red" };
                    else if (daysLeft <= 3 && badge.tone !== "red") {
                        badge = { label: "Expiring Soon", tone: "yellow" };
                    }
                }
            }

            return { ...it, daysLeft, badge };
        });
    }, [items]);

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">🧾 Prescription Renewals</h2>
                <Badge label={`${computed.length} items`} tone="indigo" />
            </header>

            {/* Add / track refill item */}
            <form
                onSubmit={submit}
                className="bg-white border rounded-xl shadow-sm p-6 space-y-4"
            >
                <h3 className="text-lg font-semibold text-gray-800">Add a Medication to Track</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Medication
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Atorvastatin 10mg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Pills Remaining
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={form.remaining}
                            onChange={(e) => setForm((s) => ({ ...s, remaining: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 7"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Refill By (date)
                        </label>
                        <input
                            type="date"
                            value={form.refillBy}
                            onChange={(e) => setForm((s) => ({ ...s, refillBy: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Pharmacy (optional)
                        </label>
                        <input
                            type="text"
                            value={form.pharmacy}
                            onChange={(e) => setForm((s) => ({ ...s, pharmacy: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., CityCare Pharmacy"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
                >
                    + Add to Tracker
                </button>
            </form>

            {/* List */}
            <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Renewals</h3>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : computed.length === 0 ? (
                    <p className="text-gray-500 italic">No items yet. Add your first medication above.</p>
                ) : (
                    <div className="space-y-3">
                        {computed.map((it) => (
                            <div
                                key={it.id}
                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-xl bg-white px-4 py-3 shadow-sm hover:bg-gray-50 transition"
                            >
                                {/* left */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 text-lg">{it.name}</p>
                                        <Badge label={it.badge.label} tone={it.badge.tone} />
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {typeof it.remaining === "number"
                                            ? `${it.remaining} pill${it.remaining === 1 ? "" : "s"
                                            } left`
                                            : null}
                                        {it.refillBy
                                            ? ` • Refill by ${new Date(
                                                it.refillBy
                                            ).toLocaleDateString()}`
                                            : ""}
                                        {typeof it.daysLeft === "number"
                                            ? ` (${it.daysLeft} day${it.daysLeft === 1 ? "" : "s"
                                            } left)`
                                            : ""}
                                    </p>
                                    {it.pharmacy && (
                                        <p className="text-xs text-gray-500">Pharmacy: {it.pharmacy}</p>
                                    )}
                                </div>

                                {/* right actions */}
                                <div className="flex items-center gap-2">
                                    {it.status !== "requested" && it.status !== "approved" && (
                                        <button
                                            onClick={() => markRequested(it.id)}
                                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                                        >
                                            Request Renewal
                                        </button>
                                    )}
                                    {it.status === "requested" && (
                                        <button
                                            onClick={() => markApproved(it.id)}
                                            className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                                        >
                                            Mark Approved
                                        </button>
                                    )}
                                    <button
                                        onClick={() => remove(it.id)}
                                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100"
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
