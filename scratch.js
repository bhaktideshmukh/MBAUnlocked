const apiKey = "AIzaSyBABArrUM70YdD6bARLW57b8Ath9XKrc_4";
const modelsToTest = [
  "gemini-flash-latest",
  "gemini-2.0-flash-lite-001",
  "gemini-pro-latest",
  "gemini-2.0-flash"
];

const systemPrompt = `You are an expert. Return ["Question 1"]`;

async function test() {
  for (const model of modelsToTest) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: "Generate" }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          }
        })
      });
      console.log(`Model ${model}: ${response.status} ${response.statusText}`);
      if (response.ok) {
        console.log(`SUCCESS WITH: ${model}`);
        break;
      } else {
        console.error(await response.text());
      }
    } catch (e) {
      console.log(`Model ${model} failed to fetch`, e);
    }
  }
}

test();
