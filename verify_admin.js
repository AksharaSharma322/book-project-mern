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
        console.log("--- TEST START ---");

        // 1. Register Regular User
        const userEmail = `user_${Date.now()}@test.com`;
        const userRegData = JSON.stringify({ email: userEmail, password: "password", role: "user" });
        await request({
            hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': userRegData.length }
        }, userRegData);

        // Login User
        const userLoginRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': userRegData.length }
        }, JSON.stringify({ email: userEmail, password: "password" }));
        const userToken = userLoginRes.body.token;
        console.log("User Token acquired.");

        // 2. Register Admin User
        const adminEmail = `admin_${Date.now()}@test.com`;
        const adminRegData = JSON.stringify({ email: adminEmail, password: "password", role: "admin" });
        await request({
            hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': adminRegData.length }
        }, adminRegData);

        // Login Admin
        const adminLoginRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': adminRegData.length }
        }, JSON.stringify({ email: adminEmail, password: "password" }));
        const adminToken = adminLoginRes.body.token;
        console.log("Admin Token acquired.");

        // 3. Test Regular User access to POST (Should fail)
        const bookData = JSON.stringify({ title: "Forbidden Book", author: "Hacker", description: "This should fail" });
        const failRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/books', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': bookData.length, 'Authorization': `Bearer ${userToken}` }
        }, bookData);
        console.log(`User POST status: ${failRes.status} (Expected 403)`);
        if (failRes.status !== 403) throw new Error("User was able to add book!");

        // 4. Test Admin access to POST (Should success)
        const successRes = await request({
            hostname: 'localhost', port: 5000, path: '/api/books', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': bookData.length, 'Authorization': `Bearer ${adminToken}` }
        }, bookData);
        console.log(`Admin POST status: ${successRes.status} (Expected 201)`);
        if (successRes.status !== 201) throw new Error("Admin failed to add book!");

        const newBookId = successRes.body.data._id;

        // 5. Test Admin DELETE (Should success)
        const deleteRes = await request({
            hostname: 'localhost', port: 5000, path: `/api/books/${newBookId}`, method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log(`Admin DELETE status: ${deleteRes.status} (Expected 200)`);
        if (deleteRes.status !== 200) throw new Error("Admin failed to delete book!");

        console.log("SUCCESS: Backend Admin Protection Verified!");
    } catch (err) {
        console.error("FAILED:", err);
    }
})();
