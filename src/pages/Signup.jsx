import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../firebase/auth";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await signup(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <form
                onSubmit={handleSignup}
                className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 space-y-6"
            >
                <h2 className="text-3xl font-extrabold text-center text-gray-800">
                    Create an Account 🚀
                </h2>

                {error && (
                    <p className="text-red-600 text-sm text-center bg-red-100 py-2 px-3 rounded-lg">
                        {error}
                    </p>
                )}

                <div>
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-300"
                >
                    Sign Up
                </button>

                <p className="text-sm text-center text-gray-600">
                    Already a user?{" "}
                    <Link
                        to="/"
                        className="text-indigo-600 font-medium hover:underline"
                    >
                        Log In
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Signup;
