import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Profile() {
    const { user } = useAuth();
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem("token");

        fetch("/api/progress/all", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setProgress(result.data);
                }
                setLoading(false);
            });
    }, [user]);

    if (!user) return null;
    if (loading) return <p>Loading profile...</p>;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h2>👤 My Profile</h2>
            <p><strong>Email:</strong> {user.email}</p>

            <hr />

            <h3>📚 Reading Progress</h3>

            {progress.length === 0 ? (
                <p>No reading progress yet.</p>
            ) : (
                progress.map((p) => (
                    <div
                        key={p._id}
                        style={{
                            padding: "10px",
                            border: "1px solid #ddd",
                            marginBottom: "10px",
                            borderRadius: "5px",
                        }}
                    >
                        <strong>{p.bookId.title}</strong>
                        <p>
                            Last read chapter:{" "}
                            <strong>{p.currentChapterIndex + 1}</strong>
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Profile;
