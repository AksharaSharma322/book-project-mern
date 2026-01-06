import { useEffect, useState } from "react";

function AdminDashboard() {
    const [books, setBooks] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch("/api/books", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBooks(data.data);
                }
            });
    }, [token]);

    const deleteBook = async (id) => {
        const res = await fetch(`/api/books/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (data.success) {
            setBooks(prev => prev.filter(book => book._id !== id));
        } else {
            alert(data.error);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h2>🧑‍💼 Admin Dashboard</h2>

            <button className="btn" style={{ marginBottom: "20px" }}>
                ➕ Add New Book
            </button>

            {books.length === 0 ? (
                <p>No books available.</p>
            ) : (
                books.map(book => (
                    <div key={book._id} className="card">
                        <h4>{book.title}</h4>
                        <p>by {book.author}</p>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button className="btn btn-secondary">Edit</button>
                            <button
                                className="btn btn-danger"
                                onClick={() => deleteBook(book._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default AdminDashboard;
