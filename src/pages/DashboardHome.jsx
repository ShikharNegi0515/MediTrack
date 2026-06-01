import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { auth, onAuthReady } from "../firebase/firebase";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

const MEDICATIONS_URL =
  "https://meditrack-a9867-default-rtdb.asia-southeast1.firebasedatabase.app/medications";

const quickLinks = [
  { to: "medications", label: "Medications", desc: "Log doses & track today", icon: "💊" },
  { to: "reminders", label: "Reminders", desc: "Schedule alerts", icon: "⏰" },
  { to: "refill-tracker", label: "Refills", desc: "Monitor supply", icon: "🧾" },
  { to: "reports", label: "Reports", desc: "View adherence", icon: "📊" },
];

export default function DashboardHome() {
  const [stats, setStats] = useState({ total: 0, taken: 0, missed: 0, pending: 0 });

  useEffect(() => {
    (async () => {
      const user = await onAuthReady();
      if (!user) return;

      try {
        const res = await axios.get(`${MEDICATIONS_URL}.json`);
        if (!res.data) return;

        const userMeds = Object.values(res.data).filter((m) => m.userId === user.uid);
        let taken = 0;
        let missed = 0;
        let pending = 0;

        userMeds.forEach((m) => {
          if (m.status === "taken") taken++;
          else if (m.status === "missed") missed++;
          else pending++;
        });

        setStats({ total: userMeds.length, taken, missed, pending });
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const adherence =
    stats.taken + stats.missed > 0
      ? Math.round((stats.taken / (stats.taken + stats.missed)) * 100)
      : null;

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Welcome back"
        subtitle={
          auth.currentUser?.email
            ? `Signed in as ${auth.currentUser.email}`
            : "Manage your medications in one place"
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active meds", value: stats.total, color: "text-brand-700 bg-brand-50" },
          { label: "Taken today", value: stats.taken, color: "text-emerald-700 bg-emerald-50" },
          { label: "Missed", value: stats.missed, color: "text-red-700 bg-red-50" },
          { label: "Pending", value: stats.pending, color: "text-amber-700 bg-amber-50" },
        ].map((s) => (
          <Card key={s.label} className="!p-5">
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {adherence !== null && (
        <Card className="border-brand-100 bg-gradient-to-r from-brand-50 to-white !p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Adherence rate</p>
              <p className="text-3xl font-bold text-brand-700">{adherence}%</p>
            </div>
            <div className="h-3 flex-1 max-w-xs overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                style={{ width: `${adherence}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition group-hover:scale-105">
                {link.icon}
              </span>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-brand-700">
                  {link.label}
                </p>
                <p className="text-sm text-slate-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
