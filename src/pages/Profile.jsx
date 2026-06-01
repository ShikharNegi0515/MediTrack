import { useState, useEffect } from "react";
import axios from "axios";
import { onAuthReady } from "../firebase/firebase";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

const FIREBASE_BASE =
  "https://meditrack-a9867-default-rtdb.asia-southeast1.firebasedatabase.app";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    allergies: "",
    conditions: "",
    doctor: "",
  });
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [profilePath, setProfilePath] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await onAuthReady();
      if (!user) return;

      setEmail(user.email || "");
      const path = `${FIREBASE_BASE}/profiles/${user.uid}.json`;
      setProfilePath(path);

      try {
        const res = await axios.get(path);
        if (res.data) setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profilePath) return;

    try {
      await axios.put(profilePath, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-container animate-slide-up">
      <PageHeader title="Profile" subtitle="Your health information stays private to your account" />

      <Card className="mx-auto max-w-lg">
        {email && (
          <div className="mb-6 rounded-xl bg-brand-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Account: </span>
            <span className="font-medium text-brand-800">{email}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Full name</label>
            <input
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={profile.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Age</label>
            <input
              type="number"
              name="age"
              min="0"
              placeholder="30"
              value={profile.age}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Allergies</label>
            <textarea
              name="allergies"
              placeholder="Penicillin, peanuts..."
              value={profile.allergies}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Current conditions
            </label>
            <textarea
              name="conditions"
              placeholder="Diabetes, hypertension..."
              value={profile.conditions}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Doctor contact
            </label>
            <input
              type="text"
              name="doctor"
              placeholder="Dr. Smith — (555) 123-4567"
              value={profile.doctor}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Save profile
          </button>

          {saved && (
            <p className="text-center text-sm font-medium text-emerald-600" role="status">
              Profile saved successfully
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}

export default Profile;
