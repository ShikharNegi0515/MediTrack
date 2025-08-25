import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import {
    requestNotificationPermission,
    subscribeToForegroundMessages,
} from "../firebase/firebase";

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // 🔔 Setup Notifications
    useEffect(() => {
        (async () => {
            const token = await requestNotificationPermission();
            if (token) {
                console.log("FCM Token saved:", token);
            }
            subscribeToForegroundMessages();
        })();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/");
    };

    const navLinks = [
        { to: "medications", label: "Medications" },
        { to: "reminders", label: "Reminders" },
        { to: "refill-tracker", label: "Refill Tracker" },
        { to: "reports", label: "Reports" },
        { to: "history", label: "History" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-indigo-600 text-white px-8 py-4 flex justify-between items-center shadow-lg">
                {/* Logo */}
                <h1 className="text-2xl font-extrabold tracking-wide">
                    Medi<span className="text-yellow-300">Track</span>
                </h1>

                {/* Nav Links */}
                <div className="flex gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`px-3 py-2 rounded-md font-medium transition duration-200
                                ${location.pathname.includes(link.to)
                                    ? "bg-indigo-800 text-yellow-300 shadow-md"
                                    : "hover:bg-indigo-500 hover:shadow"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-2 focus:outline-none px-3 py-2 rounded-md 
                                   hover:bg-indigo-500 transition duration-200"
                    >
                        <FaUserCircle className="text-3xl transition-transform duration-200 group-hover:scale-110" />
                        <span className="font-medium">User</span>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                            <Link
                                to="profile"
                                className="block px-4 py-2 hover:bg-gray-100 transition"
                                onClick={() => setMenuOpen(false)}
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto py-10 px-6">
                <Outlet />
            </div>
        </div>
    );
}
