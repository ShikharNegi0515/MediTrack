import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <LoadingSpinner label="Checking session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
