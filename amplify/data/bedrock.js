export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

  // CƠ CHẾ DỰ PHÒNG AN TOÀN (Lưu ý bảo mật khi push lên GitHub)
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
  // 1. Bắt lỗi hệ thống mạng của AWS
  if (ctx.error) {
    return { body: null, error: `Lỗi AWS: ${ctx.error.message}` };
  }
  
  // 2. Bắt lỗi bị Google chặn (Ví dụ: Mã Key sai sẽ trả về lỗi 403)
  if (ctx.result.statusCode !== 200) {
    return { body: null, error: `Google API từ chối với mã ${ctx.result.statusCode}. Vui lòng check lại API Key.` };
  }

  // 3. Ép kiểu trực tiếp (TUYỆT ĐỐI KHÔNG DÙNG try...catch Ở ĐÂY)
  const parsedBody = JSON.parse(ctx.result.body);

  if (parsedBody.error) {
    return { body: null, error: parsedBody.error.message };
  }

  // 4. Bóc tách an toàn
  if (!parsedBody.candidates || parsedBody.candidates.length === 0 || !parsedBody.candidates[0].content) {
    return { body: null, error: "Google không trả về công thức nấu ăn nào." };
  }

  const textContent = parsedBody.candidates[0].content.parts[0].text;
  
  return {
    body: textContent,
    error: null
  };
}