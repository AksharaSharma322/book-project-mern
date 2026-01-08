import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Profile() {
    const { user } = useAuth();
    const [progressList, setProgressList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem("token");

        fetch("/api/progress/all", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.success) {
                    setProgressList(result.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    if (!user) {
        return <p>Please login to view your profile.</p>;
    }

    if (loading) {
        return <p>Loading profile...</p>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h2>👤 My Profile</h2>
            <p><strong>Email:</strong> {user.email}</p>

            <hr />

            <h3>📚 Reading Progress</h3>

            {progressList.length === 0 ? (
                <p>No reading progress yet.</p>
            ) : (
                progressList.map((p) => (
                    <div
                        key={p._id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "10px",
                        }}
                    >
                        <h4>{p.bookId.title}</h4>
                        <p>
                            Last read chapter:{" "}
                            <strong>{p.currentChapterIndex + 1}</strong>
                        </p>

                        <Link to={`/books/${p.bookId._id}`}>
                            Continue Reading →
                        </Link>
                    </div>
                ))
            )}
        </div>
    );
}

export default Profile;
