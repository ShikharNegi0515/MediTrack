import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase/firebase";

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

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const res = await axios.get(`${MEDICATIONS_URL}.json`);
            if (res.data) {
                const loadedMeds = Object.entries(res.data).map(([id, med]) => ({
                    id,
                    ...med,
                }));
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
        try {
            if (auth.currentUser) {
                const newMed = {
                    ...medication,
                    status: "pending", // always start as pending
                    userId: auth.currentUser.uid,
                    counters: { taken: 0, missed: 0 }, // initialize counters
                };
                const res = await axios.post(`${MEDICATIONS_URL}.json`, newMed);
                if (res.data.name) {
                    setMedications([...medications, { id: res.data.name, ...newMed }]);
                    setMedication({ name: "", dose: 1, time: "", frequency: "daily" });
                }
            } else {
                console.error("User not authenticated.");
            }
        } catch (error) {
            console.error("Error saving medication:", error);
        }
    };

    const updateStatus = async (id, newStatus, med) => {
        try {
            const prevStatus = med.status || "pending";

            // Get counters from Firebase
            const countersRes = await axios.get(`${MEDICATIONS_URL}/${id}/counters.json`);
            let counters = countersRes.data || { taken: 0, missed: 0 };

            // Adjust counters based on transition
            if (prevStatus === "pending") {
                if (newStatus === "taken") {
                    counters.taken = 1;
                    counters.missed = 0;
                } else if (newStatus === "missed") {
                    counters.missed = 1;
                    counters.taken = 0;
                }
            } else if (prevStatus === "taken" && newStatus === "missed") {
                counters.taken = 0;
                counters.missed = 1;
            } else if (prevStatus === "missed" && newStatus === "taken") {
                counters.taken = 1;
                counters.missed = 0;
            }
            // If same status clicked again, do nothing
            if (prevStatus === newStatus) return;

            // Update medication in Firebase (status + counters)
            await axios.patch(`${MEDICATIONS_URL}/${id}.json`, {
                status: newStatus,
                counters,
            });

            // Update local state
            setMedications((prev) =>
                prev.map((m) =>
                    m.id === id ? { ...m, status: newStatus, counters } : m
                )
            );

            // Save history entry
            const date = new Date().toISOString().split("T")[0];
            await axios.post(`${HISTORY_URL}.json`, {
                medId: id,
                medName: med.name,
                dose: med.dose,
                time: med.time,
                frequency: med.frequency,
                status: newStatus,
                date,
                userId: auth.currentUser.uid,
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

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add Medication</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Medication Name"
                    value={medication.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <div className="flex items-center gap-2">
                    <label className="font-medium">Dose:</label>
                    <button
                        type="button"
                        onClick={() =>
                            setMedication((prev) => ({
                                ...prev,
                                dose: prev.dose > 1 ? prev.dose - 1 : 1,
                            }))
                        }
                        className="px-2 py-1 bg-gray-200 rounded"
                    >
                        -
                    </button>
                    <span>{medication.dose}</span>
                    <button
                        type="button"
                        onClick={() =>
                            setMedication((prev) => ({ ...prev, dose: prev.dose + 1 }))
                        }
                        className="px-2 py-1 bg-gray-200 rounded"
                    >
                        +
                    </button>
                </div>

                <input
                    type="time"
                    name="time"
                    value={medication.time}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <select
                    name="frequency"
                    value={medication.frequency}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                </select>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Add Medication
                </button>
            </form>

            <h3 className="text-lg font-semibold mt-6 mb-3">Medication List</h3>
            <div className="space-y-3">
                {medications.map((med) => (
                    <div
                        key={med.id}
                        className={`flex justify-between items-center p-4 rounded-lg shadow-sm border transition
              ${med.status === "taken"
                                ? "bg-green-100"
                                : med.status === "missed"
                                    ? "bg-red-100"
                                    : "bg-gradient-to-r from-indigo-50 to-white hover:shadow-md"
                            }`}
                    >
                        <div className="flex flex-col gap-2">
                            <p className="font-bold text-indigo-700 text-lg capitalize">
                                {med.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                    {med.dose} pill{med.dose > 1 ? "s" : ""}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                    {med.time}
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                                    {med.frequency}
                                </span>
                            </div>
                            {/* {med.counters && (
                                <div className="flex gap-2 text-sm mt-1">
                                    <span className="text-green-700">
                                        Taken: {med.counters.taken}
                                    </span>
                                    <span className="text-red-700">
                                        Missed: {med.counters.missed}
                                    </span>
                                </div>
                            )} */}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => updateStatus(med.id, "taken", med)}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm shadow"
                            >
                                Taken
                            </button>
                            <button
                                onClick={() => updateStatus(med.id, "missed", med)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm shadow"
                            >
                                Missed
                            </button>
                            <button
                                onClick={() => removeMedication(med.id)}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm shadow"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Medication;
