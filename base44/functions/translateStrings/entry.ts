import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { strings, targetLanguage } = await req.json();
    if (!strings || !targetLanguage) {
      return Response.json({ error: 'Missing strings or targetLanguage' }, { status: 400 });
    }

    // English needs no translation
    if (targetLanguage.toLowerCase() === 'english' || targetLanguage.toLowerCase() === 'en') {
      return Response.json({ translations: strings });
    }

    const keys = Object.keys(strings);
    const sourceObj = {};
    for (const k of keys) sourceObj[k] = strings[k];

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional app localization engine. Translate the VALUES of the following JSON object from English into ${targetLanguage}.
Rules:
- Keep every key EXACTLY the same.
- Translate only the values, naturally and concisely, as they would appear in a mobile social app UI.
- Preserve any emoji and punctuation.
- Do not add explanations. Return ONLY the translated JSON object.

JSON to translate:
${JSON.stringify(sourceObj)}`,
      response_json_schema: {
        type: 'object',
        properties: keys.reduce((acc, k) => { acc[k] = { type: 'string' }; return acc; }, {}),
      },
    });

    return Response.json({ translations: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});