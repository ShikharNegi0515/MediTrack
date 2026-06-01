import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, friendlyAuthError } from "../firebase/auth";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your medications">
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
