async function testFusion() {
  const url = 'http://localhost:3000/api/chat';
  const payload = {
    messages: [{ role: 'user', content: 'write a python script' }],
    model: 'redfox-fusion',
    chatId: 'test-chat-id'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(decoder.decode(value));
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

testFusion();
