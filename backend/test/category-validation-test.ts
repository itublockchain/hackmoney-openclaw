
const BASE_URL = 'http://localhost:4000/api/v1';

async function testCategoryValidation() {
    console.log("Testing Category Validation...");

    // Case 1: Uppercase
    try {
        const res = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Bad Category' })
        });
        const data = await res.json();
        console.log(`Uppercase Test: ${res.status === 400 ? 'PASSED' : 'FAILED'} - ${JSON.stringify(data)}`);
    } catch (e) {
        console.error("Uppercase Test Failed:", e);
    }

    // Case 2: Spaces
    try {
        const res = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'bad category' })
        });
        const data = await res.json();
        console.log(`Space Test: ${res.status === 400 ? 'PASSED' : 'FAILED'} - ${JSON.stringify(data)}`);
    } catch (e) {
        console.error("Space Test Failed:", e);
    }
}

testCategoryValidation();
