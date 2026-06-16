import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

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
            <div class="value"><strong>${name}</strong> (<a href="mailto:${email}" class="highlight">${email}</a>)</div>
            
            <div class="label">Sujet</div>
            <div class="value">${subject}</div>
            
            <div class="label">Message</div>
            <div class="message-box">${message}</div>
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
      replyTo: email, // Permet de répondre directement au client
      to: emailUser, // destinataire (vous-même)
      subject: `Nouveau message de ${name} : ${subject}`,
      text: `Nom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\nMessage:\n${message}`,
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
