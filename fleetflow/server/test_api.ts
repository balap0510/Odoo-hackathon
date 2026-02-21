import axios from 'axios';

async function test() {
    try {
        console.log("Fetching drivers...")
        const drivers = await axios.get('http://localhost:5002/api/v1/drivers?status=OFF_DUTY');
        console.log("Drivers:", drivers.data)

        console.log("Fetching vehicles...")
        const vehicles = await axios.get('http://localhost:5002/api/v1/vehicles?status=AVAILABLE');
        console.log("Vehicles:", vehicles.data)

    } catch (e: any) {
        console.error(e.response ? e.response.data : e.message)
    }
}

test()
