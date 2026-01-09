import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";

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
        axios.get(`/books/${id}`)
            .then((res) => {
                // Check if wrapped in data.data or just data
                // Backend: res.json({ success: true, data: book })
                const data = res.data;
                if (data.success) {
                    setBook(data.data);
                } else {
                    setBook(data); // Fallback
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

        axios.get(`/progress/my`)
            .then((res) => {
                if (res.data.success) {
                    const allProgress = res.data.data;
                    // Backend returns array of ReadingProgress objects.
                    // Each has { userId, bookId: { ...bookData }, currentChapterIndex }
                    // OR if bookId is not populated, { userId, bookId: "...", currentChapterIndex }
                    const bookProgress = allProgress.find(p => {
                        const pBookId = typeof p.bookId === 'object' ? p.bookId?._id : p.bookId;
                        return pBookId === id;
                    });
                    setProgress(bookProgress || null);
                }
            })
            .catch(err => console.error(err));
    }, [id, user]);

    /* ---------------- AUTO SELECT LAST READ CHAPTER ---------------- */
    useEffect(() => {
        if (progress) {
            // Backend model uses 'currentChapterIndex'
            const lastRead = progress.currentChapterIndex !== undefined
                ? progress.currentChapterIndex
                : 0;
            setSelectedChapter(lastRead);
            setSelectedParagraph(0);
        }
    }, [progress]);

    /* ---------------- FETCH COMMENTS ---------------- */
    useEffect(() => {
        if (!book) return;

        axios.get(`/comments?bookId=${id}&chapterIndex=${selectedChapter}&paragraphIndex=${selectedParagraph}`)
            .then((res) => {
                if (res.data.success) {
                    setComments(res.data.data);
                }
            })
            .catch(err => console.error(err));
    }, [id, selectedChapter, selectedParagraph, book]);

    /* ---------------- MARK CHAPTER AS READ ---------------- */
    const markChapterAsRead = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            // We send 'currentChapter' as requested by user specs
            const res = await axios.post("/progress", {
                bookId: id,
                currentChapter: selectedChapter,
            });

            if (res.data.success) {
                // Update local state with the new progress returned from backend
                setProgress(res.data.data);
            }
        } catch (err) {
            console.error("Save Progress Failed", err);
            alert("Failed to save progress");
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

        setCommentLoading(true);

        try {
            const res = await axios.post("/comments", {
                bookId: id,
                chapterIndex: selectedChapter,
                paragraphIndex: selectedParagraph,
                commentText,
            });

            if (res.data.success) {
                setComments([...comments, res.data.data]);
                setCommentText("");
            }
        } catch (err) {
            alert("Failed to post comment");
        }

        setCommentLoading(false);
    };

    /* ---------------- STATES ---------------- */
    if (loading) return <p>Loading book...</p>;

    if (error || !book) {
        return (
            <div>
                <p>Error: {error || "Book not found"}</p>
                <Link to="/">← Back</Link>
            </div>
        );
    }

    /* ---------------- UI ---------------- */
    // Model uses currentChapterIndex
    const currentChapterVal = progress ? (progress.currentChapterIndex ?? 0) : -1;

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            <Link to="/">← Back to Home</Link>

            <h2>{book.title}</h2>
            {book.author && <h4>by {book.author}</h4>}
            {book.description && (
                <p>
                    <i>{book.description}</i>
                </p>
            )}

            <hr />

            {/* Reading Progress */}
            <div style={{ marginBottom: "20px" }}>
                <h3>📖 Reading Progress</h3>

                {user ? (
                    <>
                        <p>
                            Last read chapter:{" "}
                            <strong>
                                {progress ? (currentChapterVal + 1) : "Not started"}
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
                                            ? ((currentChapterVal + 1) /
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
                                currentChapterVal >= selectedChapter
                            }
                        >
                            {progress &&
                                currentChapterVal >= selectedChapter
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
