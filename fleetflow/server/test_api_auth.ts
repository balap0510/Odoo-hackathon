import axios from 'axios';

async function test() {
    try {
        console.log("Logging in as dispatcher...")
        const loginRes = await axios.post('http://localhost:5002/api/v1/auth/login', {
            email: 'dispatcher@fleetflow.com',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log("Fetching drivers...")
        const drivers = await axios.get('http://localhost:5002/api/v1/drivers?status=OFF_DUTY', config);
        console.log("Available Drivers:", drivers.data)

        console.log("Fetching vehicles...")
        const vehicles = await axios.get('http://localhost:5002/api/v1/vehicles?status=AVAILABLE', config);
        console.log("Available Vehicles:", vehicles.data)

    } catch (e: any) {
        console.error("Error:", e.response ? e.response.data : e.message)
    }
}

test()
