import { useEffect, useState } from "react";

export default function Settings() {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-3xl mx-auto py-10 px-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                    Settings
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                        Appearance
                    </h2>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                            Dark Mode
                        </span>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ${darkMode ? "bg-indigo-600" : "bg-gray-300"
                                }`}
                        >
                            <div
                                className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${darkMode ? "translate-x-7" : ""
                                    }`}
                            ></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
