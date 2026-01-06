import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Reading progress
    const [progress, setProgress] = useState(null);

    // Selection
    const [selectedChapter, setSelectedChapter] = useState(0);
    const [selectedParagraph, setSelectedParagraph] = useState(0);

    // Comments
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    /* ---------------- FETCH BOOK ---------------- */
    useEffect(() => {
        fetch(`/api/books/${id}`)
            .then((res) => res.json())
            .then((result) => {
                if (result.success) {
                    setBook(result.data);
                } else {
                    setError(result.error || "Failed to load book");
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch book");
                setLoading(false);
            });
    }, [id]);

    /* ---------------- FETCH READING PROGRESS ---------------- */
    useEffect(() => {
        if (!user) {
            setProgress(null);
            return;
        }

        const token = localStorage.getItem("token");

        fetch(`/api/progress?bookId=${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.success) {
                    setProgress(result.data);
                }
            });
    }, [id, user]);

    /* ---------------- AUTO SELECT LAST READ CHAPTER ---------------- */
    useEffect(() => {
        if (progress) {
            setSelectedChapter(progress.currentChapterIndex);
            setSelectedParagraph(0);
        }
    }, [progress]);

    /* ---------------- FETCH COMMENTS ---------------- */
    useEffect(() => {
        if (!book) return;

        fetch(
            `/api/comments?bookId=${id}&chapterIndex=${selectedChapter}&paragraphIndex=${selectedParagraph}`
        )
            .then((res) => res.json())
            .then((result) => {
                if (result.success) {
                    setComments(result.data);
                }
            });
    }, [id, selectedChapter, selectedParagraph, book]);

    /* ---------------- MARK CHAPTER AS READ ---------------- */
    const markChapterAsRead = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        const token = localStorage.getItem("token");

        const res = await fetch("/api/progress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                bookId: id,
                currentChapterIndex: selectedChapter,
            }),
        });

        const result = await res.json();

        if (result.success) {
            setProgress(result.data);
        }
    };

    /* ---------------- ADD COMMENT ---------------- */
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        if (!user) {
            navigate("/login");
            return;
        }

        const token = localStorage.getItem("token");
        setCommentLoading(true);

        const res = await fetch("/api/comments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                bookId: id,
                chapterIndex: selectedChapter,
                paragraphIndex: selectedParagraph,
                commentText,
            }),
        });

        const result = await res.json();

        if (result.success) {
            setComments([...comments, result.data]);
            setCommentText("");
        }

        setCommentLoading(false);
    };

    /* ---------------- STATES ---------------- */
    if (loading) return <p>Loading book...</p>;

    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
                <Link to="/">← Back</Link>
            </div>
        );
    }

    /* ---------------- UI ---------------- */
    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            <Link to="/">← Back to Home</Link>

            <h2>{book.title}</h2>
            <h4>by {book.author}</h4>
            <p>
                <i>{book.description}</i>
            </p>

            <hr />

            {/* Reading Progress */}
            <div style={{ marginBottom: "20px" }}>
                <h3>📖 Reading Progress</h3>

                {user ? (
                    <>
                        <p>
                            Last read chapter:{" "}
                            <strong>
                                {progress ? progress.currentChapterIndex + 1 : "Not started"}
                            </strong>
                        </p>

                        {/* Progress Bar */}
                        {book.chapters && (
                            <div
                                style={{
                                    background: "#eee",
                                    borderRadius: "6px",
                                    height: "10px",
                                    width: "100%",
                                    marginBottom: "10px",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${progress
                                                ? ((progress.currentChapterIndex + 1) /
                                                    book.chapters.length) *
                                                100
                                                : 0
                                            }%`,
                                        background: "#4caf50",
                                        borderRadius: "6px",
                                        transition: "width 0.3s",
                                    }}
                                />
                            </div>
                        )}

                        <button
                            onClick={markChapterAsRead}
                            disabled={
                                progress &&
                                progress.currentChapterIndex >= selectedChapter
                            }
                        >
                            {progress &&
                                progress.currentChapterIndex >= selectedChapter
                                ? "Chapter already marked as read"
                                : `Mark Chapter ${selectedChapter + 1} as Read`}
                        </button>
                    </>
                ) : (
                    <button onClick={() => navigate("/login")}>
                        Login to track reading progress
                    </button>
                )}
            </div>

            <hr />

            {/* Chapters */}
            <h3>Chapters</h3>

            {book.chapters?.map((chapter, cIndex) => (
                <div key={cIndex} style={{ marginBottom: "15px" }}>
                    <h4>{chapter.title}</h4>

                    {chapter.content.map((para, pIndex) => (
                        <p
                            key={pIndex}
                            onClick={() => {
                                setSelectedChapter(cIndex);
                                setSelectedParagraph(pIndex);
                            }}
                            style={{
                                cursor: "pointer",
                                padding: "6px",
                                background:
                                    selectedChapter === cIndex &&
                                        selectedParagraph === pIndex
                                        ? "#fff3b0"
                                        : "transparent",
                            }}
                        >
                            {para}
                        </p>
                    ))}
                </div>
            ))}

            <hr />

            {/* Comments */}
            <h3>
                Comments (Chapter {selectedChapter + 1}, Paragraph{" "}
                {selectedParagraph + 1})
            </h3>

            <form onSubmit={handleCommentSubmit}>
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={!user}
                    rows="3"
                    style={{ width: "100%" }}
                />
                <br />
                <button disabled={!user || commentLoading}>
                    {commentLoading ? "Posting..." : "Post Comment"}
                </button>
            </form>

            <div style={{ marginTop: "10px" }}>
                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    comments.map((c) => (
                        <div key={c._id} style={{ borderBottom: "1px solid #eee" }}>
                            <p>{c.commentText}</p>
                            <small>
                                {new Date(c.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default BookDetail;
