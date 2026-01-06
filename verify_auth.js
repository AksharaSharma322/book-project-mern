const http = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

(async () => {
    try {
        const email = `test_${Date.now()}@example.com`;
        const password = "password123";
        const postData = JSON.stringify({ email, password });

        console.log("1. Testing Register...");
        const regRes = await post('/api/auth/register', postData);
        console.log("Register Status:", regRes.status);
        console.log("Register Body:", regRes.body);

        if (regRes.status !== 201) throw new Error("Register failed");

        console.log("\n2. Testing Login...");
        const loginRes = await post('/api/auth/login', postData);
        console.log("Login Status:", loginRes.status);
        console.log("Login Body:", loginRes.body);

        if (loginRes.status !== 200 || !loginRes.body.token) throw new Error("Login failed");

        console.log("\nSUCCESS: Auth flow working!");
    } catch (err) {
        console.error("FAILED:", err);
    }
})();
