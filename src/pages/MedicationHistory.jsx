import React, { useState, useEffect } from "react";
import axios from "axios";

const FIREBASE_URL =
    "https://meditrack-a9867-default-rtdb.asia-southeast1.firebasedatabase.app/medications";

function MedicationHistory() {
    const [medications, setMedications] = useState([]);
    const [filter, setFilter] = useState({ status: "", name: "" });
    const [expandedDates, setExpandedDates] = useState({});

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const res = await axios.get(`${FIREBASE_URL}.json`);
            if (res.data) {
                const loadedMeds = Object.entries(res.data).map(([id, med]) => ({
                    id,
                    ...med,
                }));

                // ✅ Ensure each med has a valid date
                loadedMeds.forEach((med) => {
                    if (!med.date) {
                        med.date = new Date().toLocaleDateString();
                    }
                });

                // ✅ Sort by date + time
                loadedMeds.sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time}`);
                    const dateB = new Date(`${b.date} ${b.time}`);
                    return dateB - dateA;
                });

                setMedications(loadedMeds);
            }
        } catch (error) {
            console.error("Error fetching medications:", error);
        }
    };

    function filteredMeds() {
        return medications.filter(
            (med) =>
                (filter.status === "" || med.status === filter.status) &&
                (filter.name === "" ||
                    med.name.toLowerCase().includes(filter.name.toLowerCase()))
        );
    }

    // ✅ Group by Date
    const groupedByDate = filteredMeds().reduce((acc, med) => {
        if (!acc[med.date]) acc[med.date] = [];
        acc[med.date].push(med);
        return acc;
    }, {});

    function toggleDate(date) {
        setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">📜 Medication History</h2>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={filter.name}
                    onChange={(e) => setFilter({ ...filter, name: e.target.value })}
                    className="border px-3 py-2 rounded w-60"
                />
                <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="border px-3 py-2 rounded"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="taken">Taken</option>
                    <option value="missed">Missed</option>
                </select>
            </div>

            {/* Timeline */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(groupedByDate).map(([date, meds]) => (
                    <div key={date} className="bg-white rounded-lg shadow">
                        <button
                            className="w-full flex justify-between items-center p-4 font-semibold text-left text-indigo-700 hover:bg-indigo-50 rounded-t-lg"
                            onClick={() => toggleDate(date)}
                        >
                            <span>{date}</span>
                            <span>{expandedDates[date] ? "-" : "+"}</span>
                        </button>
                        {expandedDates[date] && (
                            <div className="p-4 space-y-3">
                                {meds.map((med) => (
                                    <div
                                        key={med.id}
                                        className={`flex justify-between items-center p-3 rounded-lg border-l-4 transition
                      ${med.status === "taken"
                                                ? "border-green-500 bg-green-50"
                                                : med.status === "missed"
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-indigo-400 bg-indigo-50"
                                            }`}
                                    >
                                        <div>
                                            <p className="font-semibold text-lg capitalize">
                                                {med.name}
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                                                    {med.dose} pill{med.dose > 1 ? "s" : ""}
                                                </span>{" "}
                                                at{" "}
                                                <span className="font-medium text-gray-800">
                                                    {med.time}
                                                </span>
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${med.status === "taken"
                                                    ? "bg-green-100 text-green-700"
                                                    : med.status === "missed"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-indigo-100 text-indigo-700"
                                                }`}
                                        >
                                            {med.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MedicationHistory;
