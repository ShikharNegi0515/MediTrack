import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import axios from "axios";
import { onAuthReady } from "../firebase/firebase";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const FIREBASE_URL =
  "https://meditrack-a9867-default-rtdb.asia-southeast1.firebasedatabase.app/medications";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

function Reports() {
  const [reportData, setReportData] = useState({ taken: 0, missed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await onAuthReady();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${FIREBASE_URL}.json`);
        if (!res.data) {
          setLoading(false);
          return;
        }

        const userMeds = Object.values(res.data).filter((m) => m.userId === user.uid);
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = reportData.taken + reportData.missed;
  const adherence = total > 0 ? Math.round((reportData.taken / total) * 100) : 0;

  const pieData = {
    labels: ["Taken", "Missed"],
    datasets: [
      {
        data: [reportData.taken, reportData.missed],
        backgroundColor: ["#10b981", "#f87171"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 16, font: { family: "DM Sans", size: 13 } },
      },
      tooltip: {
        backgroundColor: "#0f766e",
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  if (loading) return <LoadingSpinner label="Loading reports..." />;

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Reports"
        subtitle="Track how consistently you take your medications"
      />

      {total === 0 ? (
        <EmptyState
          icon="📊"
          title="No report data yet"
          description="Mark medications as taken or missed to see your adherence chart."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="!p-5 text-center">
              <p className="text-sm font-medium text-slate-500">Doses taken</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600">{reportData.taken}</p>
            </Card>
            <Card className="!p-5 text-center">
              <p className="text-sm font-medium text-slate-500">Doses missed</p>
              <p className="mt-1 text-3xl font-bold text-red-500">{reportData.missed}</p>
            </Card>
            <Card className="!p-5 text-center border-brand-100 bg-brand-50/50">
              <p className="text-sm font-medium text-slate-500">Adherence</p>
              <p className="mt-1 text-3xl font-bold text-brand-700">{adherence}%</p>
            </Card>
          </div>

          <Card className="flex flex-col items-center">
            <h3 className="mb-6 text-lg font-semibold text-slate-800">Adherence breakdown</h3>
            <div className="w-full max-w-xs">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default Reports;
