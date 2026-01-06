const http = require('http');

const makeRequest = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        body: JSON.parse(data),
                    });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runTests = async () => {
    try {
        console.log("1. Fetching a Book ID...");
        const booksRes = await makeRequest('GET', '/api/books');
        const bookId = booksRes.body.data[0]._id;
        console.log("Book ID:", bookId);

        console.log("\n2. Initial Progress Fetch...");
        const initialProgress = await makeRequest('GET', `/api/progress?bookId=${bookId}`);
        console.log("Initial Status:", initialProgress.statusCode);
        const initialChapter = initialProgress.body.data ? initialProgress.body.data.currentChapterIndex : 0;
        console.log("Initial Chapter:", initialChapter);

        console.log("\n3. Updating Progress (+1)...");
        const nextChapter = initialChapter + 1;
        const updateRes = await makeRequest('POST', '/api/progress', {
            bookId: bookId,
            currentChapterIndex: nextChapter
        });
        console.log("Update Status:", updateRes.statusCode);
        console.log("New Chapter from Response:", updateRes.body.data.currentChapterIndex);

        console.log("\n4. Verifying Persistence...");
        const verifyRes = await makeRequest('GET', `/api/progress?bookId=${bookId}`);
        console.log("Verify Status:", verifyRes.statusCode);
        const persistedChapter = verifyRes.body.data.currentChapterIndex;
        console.log("Persisted Chapter:", persistedChapter);

        if (persistedChapter === nextChapter) {
            console.log("SUCCESS: Progress updated and persisted.");
        } else {
            console.log("FAILURE: Progress mismatch.");
        }

    } catch (err) {
        console.error("Test failed:", err);
    }
};

runTests();
