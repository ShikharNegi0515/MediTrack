import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, friendlyAuthError } from "../firebase/auth";
import AuthLayout from "../components/AuthLayout";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking medications in minutes">
      <form onSubmit={handleSignup} className="space-y-4">
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            minLength={6}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Signup;
