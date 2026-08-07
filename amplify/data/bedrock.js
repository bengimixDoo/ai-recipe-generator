export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

  // Thay chuỗi bên dưới bằng API Key thật của bạn để ép chạy trực tiếp không cần đợi biến môi trường AWS
  const apiKey = ctx.env.GEMINI_API_KEY || "AIzaSyAxZVekEK36F6pHtBea5zu8J5zBd6Ga_fU";

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
  // 1. Nếu AWS lỗi mạng
  if (ctx.error) {
    return { body: null, error: `AWS Error: ${ctx.error.message}` };
  }
  
  // 2. Nếu Google trả về mã lỗi HTTP khác 200 (ví dụ 400, 403 do sai key)
  if (ctx.result.statusCode !== 200) {
    return { body: null, error: `Google từ chối (Mã ${ctx.result.statusCode}): ${ctx.result.body}` };
  }

  const parsedBody = JSON.parse(ctx.result.body);

  // 3. Nếu Google trả về object lỗi bên trong JSON
  if (parsedBody.error) {
    return { body: null, error: `Google API Error: ${parsedBody.error.message}` };
  }

  // 4. Kiểm tra an toàn tuyệt đối chống văng lỗi dòng 36
  if (!parsedBody.candidates || parsedBody.candidates.length === 0) {
    return { body: null, error: "Lỗi: Google không trả về candidate nào." };
  }

  const firstCandidate = parsedBody.candidates[0];
  if (!firstCandidate.content || !firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
    return { body: null, error: "Lỗi: Cấu trúc JSON trả về từ Google bị thiếu phần text." };
  }

  const textContent = firstCandidate.content.parts[0].text;
  
  return {
    body: textContent,
    error: null
  };
}