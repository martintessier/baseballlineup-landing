export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { team_name, coach_name, email, category, message } = req.body || {};
  if (!team_name || !coach_name || !email) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const categoryLine = category ? `<p><strong>Catégorie :</strong> ${category}</p>` : "";
  const messageLine = message ? `<p><strong>Message :</strong></p><p style="white-space:pre-wrap">${message}</p>` : "";

  const html = `
    <h2>Nouvelle demande d'équipe</h2>
    <p><strong>Équipe :</strong> ${team_name}</p>
    <p><strong>Coach :</strong> ${coach_name}</p>
    <p><strong>Email :</strong> ${email}</p>
    ${categoryLine}
    ${messageLine}
  `;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "baseballlineup.ca <noreply@baseballlineup.ca>",
      to: "martintessier.ing@gmail.com",
      reply_to: email,
      subject: `[baseballlineup] Demande d'équipe de ${coach_name}`,
      html,
    }),
  });

  if (!r.ok) {
    const err = await r.text();
    console.error("Resend error:", err);
    return res.status(500).json({ error: "Erreur envoi email" });
  }

  return res.status(200).json({ ok: true });
}
