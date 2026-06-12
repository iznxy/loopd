import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    // Supports both direct call with notification_id and entity automation payload
    const notifId = body.notification_id || body.event?.entity_id;

    if (!notifId) return Response.json({ error: "Missing notification_id" }, { status: 400 });

    // Use data from payload if available (entity automation), else fetch
    let notif = body.data;
    if (!notif || !notif.user_id) {
      const results = await base44.asServiceRole.entities.Notification.filter({ id: notifId });
      notif = results[0];
    }
    if (!notif) return Response.json({ error: "Notification not found" }, { status: 404 });

    // Get the recipient user
    const users = await base44.asServiceRole.entities.User.filter({ id: notif.user_id });
    const recipient = users[0];
    if (!recipient?.email) return Response.json({ skipped: "No email" });

    const typeLabels = {
      like: "liked your loop ❤️",
      comment: "commented on your loop 💬",
      follow: "started following you 👋",
      reloop: "relooped your content 🔁",
      tip: "sent you a tip 💝",
      mention: "mentioned you 📣",
    };

    const action = typeLabels[notif.type] || "interacted with your content";
    const fromName = notif.from_username ? `@${notif.from_username}` : "Someone";

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipient.email,
      subject: `${fromName} ${action} on Loopd`,
      body: `
Hi ${recipient.full_name || recipient.email.split("@")[0]},

${fromName} ${action}.${notif.text ? `\n\n"${notif.text}"` : ""}

Open Loopd to see what's happening!

— The Loopd Team
      `.trim(),
    });

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});