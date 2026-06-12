import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    const body = await req.json().catch(() => ({}));
    const folderId = body.folderId || null;
    const pageToken = body.pageToken || null;

    // Search for video files in Drive (or within a specific folder)
    let query = "mimeType contains 'video/' and trashed = false";
    if (folderId) query += ` and '${folderId}' in parents`;

    const params = new URLSearchParams({
      q: query,
      fields: 'files(id,name,mimeType,size,thumbnailLink,webViewLink,createdTime),nextPageToken',
      pageSize: '50',
      orderBy: 'createdTime desc',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return Response.json({ files: data.files || [], nextPageToken: data.nextPageToken || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});