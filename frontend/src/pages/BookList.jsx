import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function BookList() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch("/api/books")
            .then(res => res.json())
            .then(data => {
                if (data.success) setBooks(data.data);
            });
    }, []);

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
                        <small>by {book.author}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookList;
