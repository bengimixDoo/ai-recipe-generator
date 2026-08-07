export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

  return {
    resourcePath: `/v1beta/models/gemini-1.5-flash:generateContent`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
        process.env.GEMINI_API_KEY 
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
  const parsedBody = JSON.parse(ctx.result.body);
  
  // Bắt lỗi nếu request thất bại
  if (ctx.error) {
    return {
      body: null,
      error: ctx.error.message
    };
  }
  
  if (parsedBody.error) {
    return {
      body: null,
      error: parsedBody.error.message
    };
  }

  // Bóc tách văn bản công thức nấu ăn từ cấu trúc JSON trả về của Gemini
  const textContent = parsedBody.candidates[0].content.parts[0].text;
  
  return {
    body: textContent,
    error: null
  };
}