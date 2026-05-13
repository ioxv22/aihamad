async function testChat() {
  const url = 'http://localhost:3000/api/chat';
  const payload = {
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'gpt-4o',
    chatId: 'test-chat-id'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

testChat();
