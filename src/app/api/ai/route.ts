import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, pdfText, task, tone, length, language } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "La clé API Groq n'est pas configurée sur le serveur." },
        { status: 500 }
      );
    }

    // Construct the payload for Groq Chat Completions API
    let systemPrompt = "Tu es un assistant expert pour analyser et synthétiser des documents PDF.";
    let groqMessages: Array<{ role: string; content: string }> = [];

    if (task === 'summary') {
      const summaryLengthText = length === 'court' ? 'court et synthétique (quelques puces)' : length === 'long' ? 'très détaillé et structuré' : 'standard et équilibré';
      systemPrompt = `Tu es un assistant IA spécialisé dans l'analyse et la synthèse de documents.
Rédige un résumé de niveau ${summaryLengthText} du document PDF fourni en français.
Utilise un ton ${tone || 'professionnel'}.
Réponds EXCLUSIVEMENT sous forme de Markdown bien structuré (titres, listes à puces, caractères gras).`;
      
      groqMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Voici le texte extrait du document PDF :\n\n${pdfText}\n\n=== FIN DU DOCUMENT ===\n\nSynthétise ce document s'il te plaît.` }
      ];
    } else if (task === 'translate') {
      systemPrompt = `Tu es un traducteur professionnel expert.
Traduis le document PDF fourni en ${language || 'Anglais'}.
Conserve le sens d'origine et la structure logique.
Restitue la traduction sous forme de Markdown propre en français/langue cible.`;
      
      groqMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Voici le texte extrait du document PDF :\n\n${pdfText}\n\n=== FIN DU DOCUMENT ===\n\nTraduis l'intégralité ou le résumé principal de ce document en ${language || 'Anglais'}.` }
      ];
    } else if (task === 'translate-blocks') {
      systemPrompt = `Tu es un traducteur professionnel expert.
Tu dois traduire un tableau JSON de lignes de texte d'un document PDF en ${language || 'Anglais'}.

Pour garantir une traduction parfaite et sans aucune erreur, prends ton temps et utilise la méthode de réflexion (Chain of Thought) suivante :
1. Analyse l'ensemble du contexte des phrases fournies dans le tableau.
2. Formule ta réflexion et ton raisonnement sur les structures grammaticales, le ton et l'ordre des mots dans le champ "thinking".
3. Rédige ensuite les traductions exactes de chaque élément dans le tableau "translations".

Tu dois obligatoirement renvoyer un objet JSON contenant exactement ces deux champs :
{
  \"thinking\": \"Analyse grammaticale et sémantique étape par étape...\",
  \"translations\": [
    \"traduction de l'élément 0\",
    \"traduction de l'élément 1\",
    ...
  ]
}

Le tableau \"translations\" doit impérativement avoir le même nombre d'éléments et dans le même ordre que le tableau d'entrée. Renvoie uniquement le JSON valide, sans texte d'introduction ni de conclusion.`;

      groqMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: pdfText }
      ];
    } else if (task === 'verify-translation') {
      systemPrompt = `Tu es un réviseur professionnel de traduction expert.
Tu dois relire, vérifier et corriger la traduction de blocs de texte d'un document PDF en ${language || 'Anglais'}.
On te fournit un objet JSON contenant :
- "original" : le tableau d'origine des blocs de texte
- "proposed" : le tableau des traductions proposées

Fais très attention aux points suivants :
1. La structure du document doit être préservée : le tableau de sortie corrigé "translations" doit IMPÉRATIVEMENT faire EXACTEMENT la même longueur que le tableau "original".
2. La traduction doit être naturelle, fluide et fidèle au sens original.
3. Aucun bloc de texte ne doit être oublié, laissé non traduit (sauf si c'est un nom propre ou un élément technique ne devant pas l'être), fusionné ou omis.

Prends ton temps pour analyser et corriger chaque bloc dans le champ de réflexion "thinking".
Retourne obligatoirement un objet JSON valide sous ce format précis :
{
  "thinking": "Analyse grammaticale, comparaison et corrections apportées...",
  "translations": [
    "traduction corrigée de l'élément 0",
    "traduction corrigée de l'élément 1",
    ...
  ]
}`;
      groqMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: pdfText }
      ];
    } else if (task === 'chat') {
      systemPrompt = `Tu es un assistant d'analyse documentaire intelligent et précis.
Réponds aux questions de l'utilisateur en te basant STRICTEMENT sur le document PDF fourni ci-dessous.
Si le document ne permet pas de répondre, dis-le clairement sans inventer d'information.
Reste concis, précis et réponds en français sous forme de Markdown.`;
      
      // We put the document content in the system prompt or first user message
      groqMessages = [
        { role: 'system', content: `${systemPrompt}\n\nContenu du document PDF :\n\n${pdfText}\n\n=== FIN DU DOCUMENT ===` },
        ...messages
      ];
    } else {
      groqMessages = messages;
    }

    // Call Groq endpoint
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.3,
        max_tokens: 4096
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `Erreur Groq HTTP ${groqResponse.status}`;
      return NextResponse.json({ error: errorMsg }, { status: groqResponse.status });
    }

    const result = await groqResponse.json();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Erreur API Route:', err);
    return NextResponse.json({ error: err.message || 'Une erreur serveur est survenue' }, { status: 500 });
  }
}
