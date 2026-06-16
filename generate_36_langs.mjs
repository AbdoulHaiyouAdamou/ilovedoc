import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';

const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const apiKeyMatch = envContent.match(/GROQ_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error("Please set GROQ_API_KEY environment variable");
  process.exit(1);
}

const groq = new Groq({ apiKey });

const languages = [
  'it', 'pt', 'ja', 'ru', 'ko', 'zh', 'ar', 'bg', 'ca', 'nl', 'el', 'hi', 'id', 'ms', 'pl', 'sv', 'th', 'tr', 'uk', 'vi', 'sw', 'az', 'cs', 'da', 'eu', 'fa', 'ga', 'hr', 'hu', 'ml', 'no', 'ro', 'sk', 'sl', 'sr'
];

const CODE_TO_LANG = {
  'it': 'Italian', 'pt': 'Portuguese', 'ja': 'Japanese', 'ru': 'Russian', 'ko': 'Korean', 'zh': 'Chinese (Simplified)', 'ar': 'Arabic', 'bg': 'Bulgarian', 'ca': 'Catalan', 'nl': 'Dutch', 'el': 'Greek', 'hi': 'Hindi', 'id': 'Indonesian', 'ms': 'Malay', 'pl': 'Polish', 'sv': 'Swedish', 'th': 'Thai', 'tr': 'Turkish', 'uk': 'Ukrainian', 'vi': 'Vietnamese', 'sw': 'Swahili', 'az': 'Azerbaijani', 'cs': 'Czech', 'da': 'Danish', 'eu': 'Basque', 'fa': 'Persian', 'ga': 'Irish', 'hr': 'Croatian', 'hu': 'Hungarian', 'ml': 'Malayalam', 'no': 'Norwegian', 'ro': 'Romanian', 'sk': 'Slovak', 'sl': 'Slovenian', 'sr': 'Serbian'
};

const frJsonPath = 'c:/Users/Dell/Desktop/ilovedoc/messages/fr.json';
const frContent = fs.readFileSync(frJsonPath, 'utf8');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateLanguage(code, langName) {
  const outputPath = path.join('c:/Users/Dell/Desktop/ilovedoc/messages', `${code}.json`);
  if (fs.existsSync(outputPath)) {
    console.log(`Skipping ${langName} (${code}) as it already exists.`);
    return;
  }

  console.log(`Generating translations for ${langName} (${code})...`);
  
  const prompt = `You are an expert software localization translator. Translate the following JSON UI dictionary from French to ${langName}. 
  Maintain the exact same JSON structure and keys. Only translate the string values. 
  Keep technical terms related to PDF unchanged if they shouldn't be translated.
  Make the tone professional and clear, suited for a SaaS web application.
  Output ONLY valid JSON, without any markdown formatting or \`\`\`json block.
  
  French JSON:
  ${frContent}
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    const text = chatCompletion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(text);
    fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
    console.log(`Successfully generated ${langName} (${code}).json`);
  } catch (error) {
    console.error(`Failed to generate ${langName} (${code}):`, error.message);
  }
}

async function main() {
  for (const code of languages) {
    await generateLanguage(code, CODE_TO_LANG[code]);
    await delay(1000);
  }
  console.log("All languages generated!");
}

main();
