// Messages du site (page contact, politiques) → courriel à Martin, par Resend.
// Tout ce que le visiteur tape est echappe avant d'aller dans le HTML du courriel.
const echapper = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const LIBELLES = {
  question: "Question",
  suggestion: "Suggestion",
  bogue: "Problème dans l'app",
  autre: "Autre",
  confidentialite: "Confidentialité",
  privacy: "Privacy",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, name, email, team, message, langue } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  if (String(message).length > 5000 || String(name).length > 200 || String(email).length > 200) {
    return res.status(400).json({ error: "Trop long" });
  }

  const typeLabel = LIBELLES[type] || "Contact";
  const equipe = team ? `<p><strong>Équipe :</strong> ${echapper(team)}</p>` : "";
  const html = `
    <h2>Nouveau message — ${echapper(typeLabel)}</h2>
    <p><strong>Nom :</strong> ${echapper(name)}</p>
    <p><strong>Courriel :</strong> ${echapper(email)}</p>
    ${equipe}
    ${langue === "en" ? "<p><em>Écrit en anglais (site en anglais)</em></p>" : ""}
    <p><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${echapper(message)}</p>
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
      reply_to: String(email),
      subject: `[baseballlineup] ${typeLabel} de ${String(name).slice(0, 80)}`,
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
