import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

function Reports() {
    const [reportData, setReportData] = useState({ taken: 0, missed: 0 });
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // TODO: Replace with actual Firebase fetch of reminder history
        const dummyHistory = [
            { date: "2025-08-20", taken: true },
            { date: "2025-08-21", taken: false },
            { date: "2025-08-22", taken: true },
            { date: "2025-08-23", taken: true },
            { date: "2025-08-24", taken: false },
        ];
        setHistory(dummyHistory);

        const taken = dummyHistory.filter((h) => h.taken).length;
        const missed = dummyHistory.length - taken;

        setReportData({ taken, missed });
    }, []);

    // Pie chart for overall adherence
    const pieData = {
        labels: ["Taken", "Missed"],
        datasets: [
            {
                data: [reportData.taken, reportData.missed],
                backgroundColor: ["#4CAF50", "#F44336"],
            },
        ],
    };

    // Bar chart for daily history
    const barData = {
        labels: history.map((h) => h.date),
        datasets: [
            {
                label: "Taken (1=Yes, 0=No)",
                data: history.map((h) => (h.taken ? 1 : 0)),
                backgroundColor: "#2196F3",
            },
        ],
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Medication Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white shadow rounded">
                    <h3 className="text-lg font-semibold mb-2">Overall Adherence</h3>
                    <Pie data={pieData} />
                </div>

                <div className="p-4 bg-white shadow rounded">
                    <h3 className="text-lg font-semibold mb-2">Daily History</h3>
                    <Bar data={barData} />
                </div>
            </div>
        </div>
    );
}

export default Reports;
