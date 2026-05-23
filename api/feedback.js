export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const typeLabel =
    type === "confidentialite" ? "Confidentialité" :
    type === "privacy" ? "Privacy" :
    type || "Contact";

  const html = `
    <h2>Nouveau message — ${typeLabel}</h2>
    <p><strong>Nom :</strong> ${name}</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${message}</p>
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
      subject: `[baseballlineup] ${typeLabel} de ${name}`,
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
