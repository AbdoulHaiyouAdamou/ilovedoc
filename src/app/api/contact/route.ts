import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function escapeHtml(unsafe: string) {
  return (unsafe || '').replace(/[&<"'>]/g, function (match) {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

export async function POST(request: Request) {
  try {
    // Basic Origin/Referer check
    const headersList = request.headers;
    const referer = headersList.get('referer') || '';
    const origin = headersList.get('origin') || '';
    const host = headersList.get('host') || '';
    
    // In production, require strict matching of origin or referer
    if (process.env.NODE_ENV === 'production') {
      const isAllowed = referer.includes(host) || origin.includes(host);
      if (!isAllowed) {
        return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 });
      }
    }

    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    if (name.length > 100 || subject.length > 200 || message.length > 5000 || email.length > 150) {
      return NextResponse.json(
        { error: 'Le contenu envoyé est trop volumineux.' },
        { status: 413 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const emailUser = process.env.EMAIL_USER || 'nexuslogic.pro@gmail.com';
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
      console.error('EMAIL_PASS est manquant dans les variables d\'environnement.');
      return NextResponse.json(
        { error: 'Erreur de configuration du serveur d\'e-mails.' },
        { status: 500 }
      );
    }

    // Configurer le transporteur SMTP pour Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true pour 465, false pour les autres ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Modèle HTML professionnel pour l'e-mail
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          }
          .header {
            background-color: #7c3aed; /* iLoveDoc Primary Color */
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 600;
            letter-spacing: 0.05em;
            margin-bottom: 5px;
          }
          .value {
            font-size: 16px;
            color: #111827;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f3f4f6;
          }
          .message-box {
            background-color: #f9fafb;
            border-left: 4px solid #7c3aed;
            padding: 15px 20px;
            margin-top: 10px;
            border-radius: 0 8px 8px 0;
            white-space: pre-wrap;
            color: #374151;
          }
          .footer {
            background-color: #f3f4f6;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
          }
          .highlight {
            color: #7c3aed;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouveau message iLoveDoc</h1>
          </div>
          <div class="content">
            <div class="label">Envoyé par</div>
            <div class="value"><strong>${safeName}</strong> (<a href="mailto:${safeEmail}" class="highlight">${safeEmail}</a>)</div>
            
            <div class="label">Sujet</div>
            <div class="value">${safeSubject}</div>
            
            <div class="label">Message</div>
            <div class="message-box">${safeMessage}</div>
          </div>
          <div class="footer">
            Cet e-mail a été envoyé depuis le formulaire de contact de votre site <strong>iLoveDoc</strong>.
            <br>Pour répondre au client, cliquez simplement sur "Répondre".
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'e-mail
    await transporter.sendMail({
      from: `"iLoveDoc Contact" <${emailUser}>`, // expéditeur (le serveur)
      replyTo: safeEmail, // Permet de répondre directement au client
      to: emailUser, // destinataire (vous-même)
      subject: `Nouveau message de ${safeName} : ${safeSubject}`,
      text: `Nom: ${safeName}\nEmail: ${safeEmail}\nSujet: ${safeSubject}\n\nMessage:\n${safeMessage}`,
      html: htmlTemplate,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message.' },
      { status: 500 }
    );
  }
}
