import React, { useState, useEffect } from "react";
import axios from "axios";

const FIREBASE_URL =
    "https://meditrack-a9867-default-rtdb.asia-southeast1.firebasedatabase.app/profile.json";

function Profile() {
    const [profile, setProfile] = useState({
        name: "",
        age: "",
        allergies: "",
        conditions: "",
        doctor: "",
    });

    // Load Profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(FIREBASE_URL);
                if (res.data) setProfile(res.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };
        fetchProfile();
    }, []);

    // Save Profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(FIREBASE_URL, profile);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Error saving profile:", err);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">User Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={profile.age}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />

                <textarea
                    name="allergies"
                    placeholder="Allergies (comma separated)"
                    value={profile.allergies}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />

                <textarea
                    name="conditions"
                    placeholder="Current Conditions"
                    value={profile.conditions}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />

                <input
                    type="text"
                    name="doctor"
                    placeholder="Doctor Contact Info"
                    value={profile.doctor}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
                >
                    Save Profile
                </button>
            </form>
        </div>
    );
}

export default Profile;
