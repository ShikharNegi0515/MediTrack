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


function scheduleLocalNotification({ title, body, when }) {
    if (!("Notification" in window)) return () => { };

    const delay = when.getTime() - Date.now();
    if (delay <= 0) {
        try {
            new Notification(title, { body, icon: "/icon.png" });
        } catch { }
        return () => { };
    }

    const timerId = setTimeout(() => {
        try {
            new Notification(title, { body, icon: "/icon.png" });
        } catch { }
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
        let unsubscribe = () => { };
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
                    const list = snap.docs.map((d) => ({
                        id: d.id,
                        ...d.data(),
                    }));
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
        if (!user) {
            alert("Please login first.");
            return;
        }

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
            })),
        [reminders]
    );

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">⏰ Reminders</h2>

            {/* Add form */}
            <form
                onSubmit={addReminder}
                className="bg-white shadow-md rounded-lg p-6 space-y-4 border"
            >
                <h3 className="text-lg font-semibold text-gray-700">Add a Reminder</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Medication
                        </label>
                        <input
                            type="text"
                            value={medication}
                            onChange={(e) => setMedication(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Paracetamol"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
                >
                    Add Reminder
                </button>
            </form>

            {/* List */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Scheduled Reminders
                </h3>

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : formattedReminders.length === 0 ? (
                    <p className="text-gray-500 italic">No reminders yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {formattedReminders.map((r) => (
                            <li
                                key={r.id}
                                className="flex justify-between items-center bg-white shadow rounded-lg px-4 py-3 border hover:bg-gray-50 transition"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">{r.medication}</p>
                                    <p className="text-sm text-gray-500">
                                        📅 {r.local}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteReminder(r.id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
