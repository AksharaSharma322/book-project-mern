import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";

function BookList() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get("/books")
            .then(res => {
                // Handle various response structures just in case
                const data = res.data;
                if (Array.isArray(data)) {
                    setBooks(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setBooks(data.data);
                } else {
                    setBooks([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch books", err);
                setError("Failed to load books.");
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading books...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container">
            <h2 style={{ marginBottom: "20px" }}>All Books</h2>

            <div className="book-grid">
                {books.map(book => (
                    <div key={book._id} className="book-card">
                        <h3>
                            <Link to={`/books/${book._id}`}>
                                {book.title}
                            </Link>
                        </h3>
                        {book.author && <small>by {book.author}</small>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookList;
