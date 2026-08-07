export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  const prompt = `Suggest a recipe using: ${ingredients.join(", ")}`;

  return {
    resourcePath: `/v1beta/models/gemini-1.5-flash:generateContent`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": "AQ.Ab8RN6K-MSSk-7QZJS59uqufk6bn66IC2zg-LZzwekMv6KmMxA"
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    return { body: JSON.stringify(ctx.error), error: null };
  }
  return { body: ctx.result.body, error: null };
}