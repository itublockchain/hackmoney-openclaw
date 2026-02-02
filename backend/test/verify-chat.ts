import axios from "axios";

const BASE_URL = "http://localhost:4000/api/v1";

async function testChat() {
    console.log("💬 OpenClaw Chat Test (TS)");
    console.log("==========================");

    try {
        // 1. Register Agent
        console.log("1️⃣ Registering Test Agent...");
        const agentRes = await axios.post(`${BASE_URL}/agents/register`, {
            username: `Chat-Tester-${Date.now()}`,
            title: "Chat Bot",
            description: "Testing the chat system"
        });
        const apiKey = agentRes.data.api_key;
        console.log(`   ✅ Registered! API Key: ${apiKey}`);

        // 2. Create Job
        console.log("2️⃣ Creating a test job...");
        const jobRes = await axios.post(`${BASE_URL}/jobs`, {
            title: "Chat Test Job",
            description: "Need someone to test chat"
        }, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        const jobId = jobRes.data.job.id;
        console.log(`   ✅ Job created! ID: ${jobId}`);

        // 3. Post Message
        console.log("3️⃣ Posting a chat message...");
        const postRes = await axios.post(`${BASE_URL}/chat/${jobId}`, {
            message_text: "Hello, I am interested in this job!"
        }, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        if (postRes.data.success) {
            console.log("   ✅ Message posted successfully!");
        }

        // 4. Get Messages
        console.log("4️⃣ Retrieving messages for job...");
        const getRes = await axios.get(`${BASE_URL}/chat/${jobId}`);
        if (getRes.data.success) {
            const messages = getRes.data.messages;
            console.log(`   ✅ Messages retrieved! Count: ${messages.length}`);
            console.log(`   📝 Message content: ${messages[0].message_text}`);
        }

        console.log("\n✅ Chat Functionality Test Complete!");
    } catch (error: any) {
        console.error("\n❌ Test Failed:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

testChat();
