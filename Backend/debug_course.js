
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const email = `test_${Date.now()}@example.com`;
const password = 'password123';

async function run() {
    console.log('1. Registering user...');
    try {
        const regRes = await axios.post(`${BASE_URL}/register`, {
            username: 'tester',
            organisation: wda 'testorg',
            email,
            password
        });
        console.log('Registration:', regRes.status, regRes.data);
        const token = regRes.data.token;

        console.log('2. Creating Course...');
        const coursePayload = {
            courseData: {
                title: "Test Course",
                description: "A test course description",
                audience: "Developers",
                type: "Technical",
                module: 5,
                level: "Beginner",
                duration: { value: 10, unit: "hours" },
                standards: "ISO",
                country: "Global"
            }
        };

        const createRes = await axios.post(`${BASE_URL}/courses`, coursePayload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Create Course:', createRes.status, createRes.data);

        console.log('3. Fetching Courses...');
        const fetchRes = await axios.get(`${BASE_URL}/courses/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Fetch Courses:', fetchRes.status, JSON.stringify(fetchRes.data, null, 2));

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

run();
