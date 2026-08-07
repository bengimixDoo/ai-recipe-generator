export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

  const apiKey = ctx.env.GEMINI_API_KEY || "AQ.Ab8RN6K-MSSk-7QZJS59uqufk6bn66IC2zg-LZzwekMv6KmMxA";

  return {
    resourcePath: `/v1beta/models/gemini-1.5-flash:generateContent`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000
        }
      })
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    return { body: null, error: `AWS Error: ${ctx.error.message}` };
  }
  
  if (ctx.result.statusCode !== 200) {
    return { body: null, error: `Google API Error HTTP Code: ${ctx.result.statusCode} - Body: ${ctx.result.body}` };
  }

  const parsedBody = JSON.parse(ctx.result.body);

  if (parsedBody.error) {
    return { body: null, error: parsedBody.error.message };
  }

  // KIỂM TRA AN TOÀN TỪNG TẦNG CHỐNG VĂNG LỖI TYPE ERROR
  const candidates = parsedBody.candidates;
  if (!candidates || candidates.length === 0) {
    return { body: null, error: "Google không trả về kết quả nào (candidates rỗng)." };
  }

  const firstCandidate = candidates[0];
  if (!firstCandidate.content || !firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
    return { body: null, error: "Cấu trúc phản hồi từ Google bị thiếu trường content/parts." };
  }

  const textContent = firstCandidate.content.parts[0].text;
  
  return {
    body: textContent,
    error: null
  };
}