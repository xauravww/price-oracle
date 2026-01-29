import fetch from 'node-fetch';

async function testVision() {
  const payload = {
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What is in this image?" },
          { type: "image_url", image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gnome-pda.svg/1200px-Gnome-pda.svg.png" } }
        ]
      }
    ]
  };

  console.log("🚀 Sending vision request to local server...");
  
  try {
    const response = await fetch('http://localhost:3001/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-wrapper-key-here'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("📦 Response Status:", response.status);
    console.log("📝 Response Body:", JSON.stringify(data, null, 2));
    
    if (data.model && (data.model.includes('vision') || data.model.includes('gpt-4o') || data.model.includes('claude-3-5'))) {
      console.log("✅ SUCCESS: Vision model correctly selected: " + data.model);
    } else {
      console.log("❌ FAILURE: Vision model not selected. Model used: " + (data.model || 'unknown'));
    }
  } catch (error) {
    console.error("❌ Error connecting to server. Make sure server.js is running on port 3001.");
    console.error(error.message);
  }
}

testVision();
