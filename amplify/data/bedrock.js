export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

  const apiKey = ctx.env.GEMINI_API_KEY;

  return {
    resourcePath: `/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json"
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
    return { body: null, error: `Google API Error ${ctx.result.statusCode}: ${ctx.result.body}` };
  }

  const parsedBody = JSON.parse(ctx.result.body);

  if (parsedBody.error) {
    return { body: null, error: parsedBody.error.message };
  }

  if (!parsedBody.candidates || parsedBody.candidates.length === 0) {
    return { body: null, error: "Google API returned no candidates" };
  }

  const firstCandidate = parsedBody.candidates[0];
  if (!firstCandidate.content || !firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
    return { body: null, error: "Invalid response structure from Google" };
  }

  return {
    body: firstCandidate.content.parts[0].text,
    error: null
  };
}