import { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [progress, setProgress] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Fetch user profile
                const userRes = await axios.get("/auth/me");
                setUser(userRes.data);

                // Fetch reading progress
                try {
                    const progressRes = await axios.get("/progress/my");
                    // Backend returns { success: true, data: [...] }
                    setProgress(progressRes.data.data || []);
                } catch (progressErr) {
                    console.error("Failed to load progress", progressErr);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>{error}</p>;
    if (!user) return <p>No user data found.</p>;

    return (
        <div className="container">
            <h2>My Profile</h2>
            <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user._id || user.id}</p>
            </div>

            <h3>Reading Progress</h3>
            {progress.length === 0 ? (
                <p>No reading progress yet.</p>
            ) : (
                <ul className="progress-list">
                    {progress.map((p) => (
                        <li key={p._id} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                            {/* p.bookId is the populated Book object */}
                            <strong>{p.bookId?.title || "Unknown Book"}</strong> – Chapter {(p.currentChapterIndex || 0) + 1}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
