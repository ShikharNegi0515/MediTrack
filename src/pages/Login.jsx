import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../firebase/auth";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
            <form
                onSubmit={handleLogin}
                className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 space-y-6"
            >
                <h2 className="text-3xl font-extrabold text-center text-gray-800">
                    Welcome Back 👋
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
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition duration-300"
                >
                    Log In
                </button>

                <p className="text-sm text-center text-gray-600">
                    Don’t have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-purple-600 font-medium hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
