const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });
        req.on('error', (e) => reject(e));
        if (data) req.write(data);
        req.end();
    });
}

(async () => {
    try {
        console.log("1. Logging in...");
        const loginData = JSON.stringify({ email: "test_1766933685431@example.com", password: "password123" });
        // Note: Using the email from previous verification output in step 163. Adjust if needed or register new.
        // Actually, let's just register a new one to be safe.
        const email = `prot_test_${Date.now()}@test.com`;
        const regData = JSON.stringify({ email, password: "password123" });

        const regRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': regData.length }
        }, regData);
        console.log("Register Res:", regRes.status, regRes.body);

        const currentLoginData = JSON.stringify({ email, password: "password123" });
        const loginRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': currentLoginData.length }
        }, currentLoginData);
        console.log("Login Res:", loginRes.body);

        const token = loginRes.body.token;
        if (!token) throw new Error("Login failed to get token");
        console.log("Token obtained.");

        console.log("2. Posting comment WITHOUT token (Should fail)...");
        // Need a valid book ID. Let's fetch books first.
        const booksRes = await request({ hostname: 'localhost', port: 5000, path: '/api/books', method: 'GET' });
        const bookId = booksRes.body.data[0]._id;

        const commentData = JSON.stringify({
            bookId, chapterIndex: 0, paragraphIndex: 0, commentText: "Protected test"
        });

        const failRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/comments', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': commentData.length }
        }, commentData);

        console.log(`Status without token: ${failRes.status}`);
        if (failRes.status !== 401) throw new Error("Available without token! Protection failed.");

        console.log("3. Posting comment WITH token (Should succeed)...");
        const successRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/comments', method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': commentData.length,
                'Authorization': `Bearer ${token}`
            }
        }, commentData);

        console.log(`Status with token: ${successRes.status}`);
        if (successRes.status !== 201) throw new Error("Failed with token!");

        console.log("SUCCESS: Route protection verified!");

    } catch (err) {
        console.error("FAILED:", err);
    }
})();
