import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import axios from "axios";
import { auth } from "../firebase/firebase";

const FIREBASE_URL =
    "https://meditrack-a9867-default-rtdb.asia-southeast1.firebasedatabase.app/medications";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

function Reports() {
    const [reportData, setReportData] = useState({ taken: 0, missed: 0 });

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return;

            try {
                const res = await axios.get(`${FIREBASE_URL}.json`);
                if (!res.data) return;

                const userMeds = Object.values(res.data).filter(
                    (m) => m.userId === auth.currentUser.uid
                );

                // Sum counters
                let totalTaken = 0;
                let totalMissed = 0;
                userMeds.forEach((m) => {
                    const c = m.counters || { taken: 0, missed: 0 };
                    totalTaken += c.taken;
                    totalMissed += c.missed;
                });

                setReportData({ taken: totalTaken, missed: totalMissed });
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const pieData = {
        labels: ["Taken", "Missed"],
        datasets: [
            {
                data: [reportData.taken, reportData.missed],
                backgroundColor: ["#4CAF50", "#F44336"],
            },
        ],
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Medication Reports</h2>
            {reportData.taken + reportData.missed > 0 ? (
                <div className="flex justify-center">
                    <div style={{ width: "300px", height: "300px" }}>
                        <Pie data={pieData} />
                    </div>
                </div>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
}

export default Reports;
