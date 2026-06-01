import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import {
  requestNotificationPermission,
  subscribeToForegroundMessages,
  auth,
} from "../firebase/firebase";
import { logout } from "../firebase/auth";

const navLinks = [
  { to: "/dashboard", label: "Home", end: true },
  { to: "/dashboard/medications", label: "Medications" },
  { to: "/dashboard/reminders", label: "Reminders" },
  { to: "/dashboard/refill-tracker", label: "Refills" },
  { to: "/dashboard/reports", label: "Reports" },
  { to: "/dashboard/history", label: "History" },
];

function NavLink({ to, label, end, onClick }) {
  const location = useLocation();
  const active = end
    ? location.pathname === to || location.pathname === `${to}/`
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-white/20 text-white shadow-inner"
          : "text-teal-50 hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const menuRef = useRef(null);
  const displayName =
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split("@")[0] ||
    "User";

  useEffect(() => {
    (async () => {
      const token = await requestNotificationPermission();
      if (token) console.log("FCM Token saved:", token);
      subscribeToForegroundMessages();
    })();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-40 border-b border-brand-800/30 bg-gradient-to-r from-brand-800 to-brand-600 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="shrink-0 text-xl font-extrabold tracking-tight sm:text-2xl">
            Medi<span className="text-amber-300">Track</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Toggle menu"
            >
              {mobileNav ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/10 sm:px-3"
              >
                <FaUserCircle className="text-2xl sm:text-3xl" />
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                  {displayName}
                </span>
              </button>

              {menuOpen && (
                <div className="animate-fade-in absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-slate-700 shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
                    {auth.currentUser?.email}
                  </div>
                  <Link
                    to="/dashboard/profile"
                    className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {mobileNav && (
          <div className="flex flex-wrap gap-1 border-t border-white/10 px-4 py-3 lg:hidden">
            {navLinks.map((link) => (
              <NavLink key={link.to} {...link} onClick={() => setMobileNav(false)} />
            ))}
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
