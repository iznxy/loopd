import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get("GIPHY_API_KEY");
    if (!apiKey) return Response.json({ error: 'Giphy API key not configured' }, { status: 500 });

    const { query } = await req.json().catch(() => ({}));
    const q = (query || "").trim();

    const endpoint = q
      ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=24&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=24&rating=g`;

    const res = await fetch(endpoint);
    const data = await res.json();

    const gifs = (data.data || []).map((g) => ({
      id: g.id,
      title: g.title,
      preview: g.images?.fixed_height_small?.url,
      full: g.images?.fixed_height?.url,
    }));

    return Response.json({ gifs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});