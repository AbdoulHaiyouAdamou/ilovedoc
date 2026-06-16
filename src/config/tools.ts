import {
  Link, Scissors, Trash2, FileOutput, Rows3,
  Minimize, Wrench, Layers, FileText, Table,
  Projector, Image as ImageIcon, Palette, Globe, Archive,
  BookOpen, FileSpreadsheet, MonitorPlay,
  Type, RefreshCw, Hash, Droplet, PenTool, FormInput,
  EyeOff, Crop, Lock, Unlock, ScanText, GitCompare,
  Bot, MessageSquare, Languages, FolderOpen, Zap, Import, Download,
  Info, Stamp, Paperclip, ImageDown, ImageOff, LayoutGrid,
  Copy, ShieldCheck, FileX
} from 'lucide-react';

export type ToolCategory =
  | 'organize'
  | 'optimize'
  | 'convert-to'
  | 'convert-from'
  | 'edit'
  | 'security'
  | 'ai';

export interface Tool {
  slug: string;
  name: string;
  description: string;
  icon: any; // LucideIcon
  category: ToolCategory;
  color: [string, string];
  isAvailable: boolean;
  keywords?: string[];
}

export const toolCategories: Record<ToolCategory, { label: string; icon: any }> = {
  organize:     { label: 'Organiser',       icon: FolderOpen },
  optimize:     { label: 'Optimiser',       icon: Zap },
  'convert-to': { label: 'Convertir en',    icon: Import },
  'convert-from':{ label: 'Convertir depuis',icon: Download },
  edit:         { label: 'Éditer',          icon: PenTool },
  security:     { label: 'Sécurité',        icon: Lock },
  ai:           { label: 'IA',              icon: Bot },
};

export const tools: Tool[] = [
  /* ── Organize ──────────────────────────────────────────────── */
  {
    slug: 'merge-pdf',
    name: 'Fusionner PDF',
    description: 'Combinez plusieurs fichiers PDF en un seul document.',
    icon: Link,
    category: 'organize',
    color: ['#7c3aed', '#4f46e5'],
    isAvailable: true,
    keywords: ['fusionner', 'combiner', 'joindre', 'merge'],
  },
  {
    slug: 'split-pdf',
    name: 'Diviser PDF',
    description: 'Séparez un PDF en plusieurs fichiers ou extrayez des pages.',
    icon: Scissors,
    category: 'organize',
    color: ['#6366f1', '#4f46e5'],
    isAvailable: true,
    keywords: ['diviser', 'séparer', 'extraire', 'split'],
  },
  {
    slug: 'remove-pages',
    name: 'Supprimer des pages',
    description: 'Supprimez les pages indésirables de votre PDF.',
    icon: Trash2,
    category: 'organize',
    color: ['#ef4444', '#dc2626'],
    isAvailable: true,
    keywords: ['supprimer', 'retirer', 'pages', 'remove'],
  },
  {
    slug: 'extract-pages',
    name: 'Extraire des pages',
    description: 'Extrayez des pages spécifiques pour créer un nouveau PDF.',
    icon: FileOutput,
    category: 'organize',
    color: ['#8b5cf6', '#7c3aed'],
    isAvailable: true,
    keywords: ['extraire', 'pages', 'extract'],
  },
  {
    slug: 'organize-pdf',
    name: 'Organiser PDF',
    description: 'Triez et réorganisez les pages de votre PDF.',
    icon: Rows3,
    category: 'organize',
    color: ['#a78bfa', '#7c3aed'],
    isAvailable: true,
    keywords: ['organiser', 'trier', 'réorganiser', 'organize'],
  },

  /* ── Optimize ──────────────────────────────────────────────── */
  {
    slug: 'compress-pdf',
    name: 'Compresser PDF',
    description: 'Réduisez la taille de vos fichiers PDF sans perte de qualité.',
    icon: Minimize,
    category: 'optimize',
    color: ['#10b981', '#059669'],
    isAvailable: true,
    keywords: ['compresser', 'réduire', 'taille', 'compress'],
  },
  {
    slug: 'repair-pdf',
    name: 'Réparer PDF',
    description: 'Réparez un fichier PDF endommagé ou corrompu.',
    icon: Wrench,
    category: 'optimize',
    color: ['#f59e0b', '#d97706'],
    isAvailable: true,
    keywords: ['réparer', 'corriger', 'endommagé', 'repair'],
  },
  {
    slug: 'flatten-pdf',
    name: 'Aplatir PDF',
    description: 'Aplatissez les formulaires et annotations de votre PDF.',
    icon: Layers,
    category: 'optimize',
    color: ['#06b6d4', '#0891b2'],
    isAvailable: true,
    keywords: ['aplatir', 'formulaires', 'flatten'],
  },

  /* ── Convert To ────────────────────────────────────────────── */
  {
    slug: 'pdf-to-word',
    name: 'PDF en Word',
    description: 'Convertissez vos PDF en documents Word éditables.',
    icon: FileText,
    category: 'convert-to',
    color: ['#2563eb', '#1d4ed8'],
    isAvailable: true,
    keywords: ['word', 'docx', 'convertir', 'pdf to word'],
  },
  {
    slug: 'pdf-to-excel',
    name: 'PDF en Excel',
    description: 'Convertissez vos tableaux PDF en feuilles de calcul Excel.',
    icon: Table,
    category: 'convert-to',
    color: ['#16a34a', '#15803d'],
    isAvailable: true,
    keywords: ['excel', 'xlsx', 'tableur', 'pdf to excel'],
  },
  {
    slug: 'pdf-to-ppt',
    name: 'PDF en PowerPoint',
    description: 'Transformez vos PDF en présentations PowerPoint.',
    icon: Projector,
    category: 'convert-to',
    color: ['#ea580c', '#c2410c'],
    isAvailable: true,
    keywords: ['powerpoint', 'pptx', 'présentation', 'pdf to ppt'],
  },
  {
    slug: 'pdf-to-jpg',
    name: 'PDF en JPG',
    description: 'Convertissez chaque page de votre PDF en image JPG.',
    icon: ImageIcon,
    category: 'convert-to',
    color: ['#e11d48', '#be123c'],
    isAvailable: true,
    keywords: ['jpg', 'image', 'jpeg', 'pdf to jpg'],
  },
  {
    slug: 'pdf-to-png',
    name: 'PDF en PNG',
    description: 'Exportez vos pages PDF en images PNG haute qualité.',
    icon: Palette,
    category: 'convert-to',
    color: ['#d946ef', '#c026d3'],
    isAvailable: true,
    keywords: ['png', 'image', 'pdf to png'],
  },
  {
    slug: 'pdf-to-html',
    name: 'PDF en HTML',
    description: 'Convertissez votre PDF en page web HTML.',
    icon: Globe,
    category: 'convert-to',
    color: ['#f97316', '#ea580c'],
    isAvailable: true,
    keywords: ['html', 'web', 'pdf to html'],
  },
  {
    slug: 'pdf-to-pdfa',
    name: 'PDF en PDF/A',
    description: 'Convertissez votre PDF au format PDF/A pour l\'archivage.',
    icon: Archive,
    category: 'convert-to',
    color: ['#0d9488', '#0f766e'],
    isAvailable: true,
    keywords: ['pdfa', 'archivage', 'pdf to pdfa'],
  },

  /* ── Convert From ──────────────────────────────────────────── */
  {
    slug: 'word-to-pdf',
    name: 'Word en PDF',
    description: 'Convertissez vos documents Word en PDF.',
    icon: BookOpen,
    category: 'convert-from',
    color: ['#2563eb', '#1d4ed8'],
    isAvailable: true,
    keywords: ['word', 'docx', 'convertir', 'word to pdf'],
  },
  {
    slug: 'excel-to-pdf',
    name: 'Excel en PDF',
    description: 'Transformez vos feuilles de calcul Excel en PDF.',
    icon: FileSpreadsheet,
    category: 'convert-from',
    color: ['#16a34a', '#15803d'],
    isAvailable: true,
    keywords: ['excel', 'xlsx', 'convertir', 'excel to pdf'],
  },
  {
    slug: 'ppt-to-pdf',
    name: 'PowerPoint en PDF',
    description: 'Convertissez vos présentations PowerPoint en PDF.',
    icon: MonitorPlay,
    category: 'convert-from',
    color: ['#ea580c', '#c2410c'],
    isAvailable: true,
    keywords: ['powerpoint', 'pptx', 'convertir', 'ppt to pdf'],
  },
  {
    slug: 'jpg-to-pdf',
    name: 'JPG en PDF',
    description: 'Combinez vos images JPG en un document PDF.',
    icon: ImageIcon,
    category: 'convert-from',
    color: ['#e11d48', '#be123c'],
    isAvailable: true,
    keywords: ['jpg', 'image', 'jpeg', 'jpg to pdf', 'png'],
  },
  {
    slug: 'png-to-pdf',
    name: 'PNG en PDF',
    description: 'Convertissez vos images PNG en un fichier PDF.',
    icon: Palette,
    category: 'convert-from',
    color: ['#d946ef', '#c026d3'],
    isAvailable: true,
    keywords: ['png', 'image', 'png to pdf'],
  },
  {
    slug: 'html-to-pdf',
    name: 'HTML en PDF',
    description: 'Convertissez une page web HTML en document PDF.',
    icon: Globe,
    category: 'convert-from',
    color: ['#f97316', '#ea580c'],
    isAvailable: true,
    keywords: ['html', 'web', 'html to pdf'],
  },

  /* ── Edit ──────────────────────────────────────────────────── */
  {
    slug: 'edit-pdf',
    name: 'Éditer PDF',
    description: 'Ajoutez du texte, des images et des formes à votre PDF.',
    icon: Type,
    category: 'edit',
    color: ['#7c3aed', '#6d28d9'],
    isAvailable: true,
    keywords: ['éditer', 'modifier', 'texte', 'edit'],
  },
  {
    slug: 'rotate-pdf',
    name: 'Pivoter PDF',
    description: 'Faites pivoter les pages de votre PDF.',
    icon: RefreshCw,
    category: 'edit',
    color: ['#0ea5e9', '#0284c7'],
    isAvailable: true,
    keywords: ['pivoter', 'rotation', 'rotate'],
  },
  {
    slug: 'add-page-numbers',
    name: 'Numéroter les pages',
    description: 'Ajoutez des numéros de page à votre document PDF.',
    icon: Hash,
    category: 'edit',
    color: ['#8b5cf6', '#7c3aed'],
    isAvailable: true,
    keywords: ['numéros', 'pages', 'numéroter', 'page numbers'],
  },
  {
    slug: 'add-watermark',
    name: 'Ajouter un filigrane',
    description: 'Ajoutez un filigrane texte ou image à votre PDF.',
    icon: Droplet,
    category: 'edit',
    color: ['#06b6d4', '#0891b2'],
    isAvailable: true,
    keywords: ['filigrane', 'watermark', 'marque'],
  },
  {
    slug: 'sign-pdf',
    name: 'Signer PDF',
    description: 'Signez vos documents PDF électroniquement.',
    icon: PenTool,
    category: 'edit',
    color: ['#4f46e5', '#4338ca'],
    isAvailable: true,
    keywords: ['signer', 'signature', 'électronique', 'sign'],
  },
  {
    slug: 'fill-pdf-form',
    name: 'Remplir un formulaire',
    description: 'Remplissez les formulaires PDF en ligne.',
    icon: FormInput,
    category: 'edit',
    color: ['#a855f7', '#9333ea'],
    isAvailable: true,
    keywords: ['formulaire', 'remplir', 'form', 'fill'],
  },
  {
    slug: 'redact-pdf',
    name: 'Caviarder PDF',
    description: 'Masquez les informations sensibles dans votre PDF.',
    icon: EyeOff,
    category: 'edit',
    color: ['#1e293b', '#0f172a'],
    isAvailable: true,
    keywords: ['caviarder', 'masquer', 'redact', 'censurer'],
  },
  {
    slug: 'crop-pdf',
    name: 'Rogner PDF',
    description: 'Recadrez les marges et rognez les pages de votre PDF.',
    icon: Crop,
    category: 'edit',
    color: ['#f43f5e', '#e11d48'],
    isAvailable: true,
    keywords: ['rogner', 'recadrer', 'crop', 'marges'],
  },

  /* ── Security ──────────────────────────────────────────────── */
  {
    slug: 'protect-pdf',
    name: 'Protéger PDF',
    description: 'Ajoutez un mot de passe pour protéger votre PDF.',
    icon: Lock,
    category: 'security',
    color: ['#dc2626', '#b91c1c'],
    isAvailable: true,
    keywords: ['protéger', 'mot de passe', 'chiffrer', 'protect'],
  },
  {
    slug: 'unlock-pdf',
    name: 'Déverrouiller PDF',
    description: 'Supprimez le mot de passe d\'un PDF protégé.',
    icon: Unlock,
    category: 'security',
    color: ['#16a34a', '#15803d'],
    isAvailable: true,
    keywords: ['déverrouiller', 'mot de passe', 'unlock'],
  },
  {
    slug: 'pdf-ocr',
    name: 'OCR PDF',
    description: 'Rendez votre PDF scanné consultable.',
    icon: ScanText,
    category: 'security',
    color: ['#0ea5e9', '#0284c7'],
    isAvailable: true,
    keywords: ['ocr', 'reconnaissance', 'texte', 'scanné'],
  },
  {
    slug: 'compare-pdf',
    name: 'Comparer PDF',
    description: 'Comparez deux fichiers PDF et identifiez les différences.',
    icon: GitCompare,
    category: 'security',
    color: ['#f59e0b', '#d97706'],
    isAvailable: true,
    keywords: ['comparer', 'différences', 'compare'],
  },

  /* ── AI ────────────────────────────────────────────────────── */
  {
    slug: 'ai-pdf-summary',
    name: 'Résumé IA',
    description: 'Obtenez un résumé intelligent de votre document PDF.',
    icon: Bot,
    category: 'ai',
    color: ['#7c3aed', '#ec4899'],
    isAvailable: true,
    keywords: ['ia', 'résumé', 'intelligence artificielle', 'ai summary'],
  },
  {
    slug: 'ai-pdf-chat',
    name: 'Chat avec PDF',
    description: 'Posez des questions à votre PDF grâce à l\'IA.',
    icon: MessageSquare,
    category: 'ai',
    color: ['#6366f1', '#a855f7'],
    isAvailable: true,
    keywords: ['chat', 'ia', 'questions', 'ai chat'],
  },
  {
    slug: 'ai-pdf-translate',
    name: 'Traduire PDF',
    description: 'Traduisez votre document PDF dans une autre langue avec l\'IA.',
    icon: Languages,
    category: 'ai',
    color: ['#0ea5e9', '#7c3aed'],
    isAvailable: true,
    keywords: ['traduire', 'traduction', 'langue', 'translate'],
  },

  /* ── Stirling-PDF Inspired ──────────────────────────────────── */
  {
    slug: 'edit-metadata',
    name: 'Modifier les métadonnées',
    description: 'Modifiez le titre, l\'auteur, le sujet et les mots-clés de votre PDF.',
    icon: Info,
    category: 'edit',
    color: ['#0ea5e9', '#0284c7'],
    isAvailable: true,
    keywords: ['métadonnées', 'titre', 'auteur', 'sujet', 'metadata'],
  },
  {
    slug: 'pdf-info',
    name: 'Infos du PDF',
    description: 'Affichez toutes les informations techniques de votre fichier PDF.',
    icon: FileText,
    category: 'optimize',
    color: ['#6366f1', '#4f46e5'],
    isAvailable: true,
    keywords: ['infos', 'informations', 'propriétés', 'info', 'détails'],
  },
  {
    slug: 'add-stamp',
    name: 'Ajouter un tampon',
    description: 'Ajoutez un tampon texte ou image sur les pages de votre PDF.',
    icon: Stamp,
    category: 'edit',
    color: ['#f59e0b', '#d97706'],
    isAvailable: true,
    keywords: ['tampon', 'cachet', 'stamp', 'marque'],
  },
  {
    slug: 'add-attachments',
    name: 'Pièces jointes PDF',
    description: 'Intégrez des fichiers en pièces jointes dans votre document PDF.',
    icon: Paperclip,
    category: 'edit',
    color: ['#8b5cf6', '#7c3aed'],
    isAvailable: true,
    keywords: ['pièces jointes', 'fichiers', 'attachments', 'embed'],
  },
  {
    slug: 'extract-images',
    name: 'Extraire les images',
    description: 'Extrayez toutes les images intégrées dans votre document PDF.',
    icon: ImageDown,
    category: 'convert-to',
    color: ['#ec4899', '#db2777'],
    isAvailable: true,
    keywords: ['extraire', 'images', 'photos', 'extract images'],
  },
  {
    slug: 'remove-images',
    name: 'Supprimer les images',
    description: 'Supprimez toutes les images de votre PDF pour réduire sa taille.',
    icon: ImageOff,
    category: 'optimize',
    color: ['#ef4444', '#dc2626'],
    isAvailable: true,
    keywords: ['supprimer', 'images', 'retirer', 'remove images'],
  },
  {
    slug: 'multi-page-layout',
    name: 'Mise en page multiple',
    description: 'Arrangez 2, 4, 6 ou 9 pages PDF sur une seule feuille.',
    icon: LayoutGrid,
    category: 'edit',
    color: ['#14b8a6', '#0d9488'],
    isAvailable: true,
    keywords: ['mise en page', 'multi-pages', 'n-up', '2-up', '4-up', 'imprimer'],
  },
  {
    slug: 'overlay-pdf',
    name: 'Superposer des PDF',
    description: 'Superposez un PDF sur un autre (fond de page, en-tête, signature).',
    icon: Copy,
    category: 'edit',
    color: ['#a855f7', '#9333ea'],
    isAvailable: true,
    keywords: ['superposer', 'overlay', 'fond', 'en-tête', 'letterhead'],
  },
  {
    slug: 'sanitize-pdf',
    name: 'Nettoyer le PDF',
    description: 'Supprimez le JavaScript, les liens et les métadonnées sensibles de votre PDF.',
    icon: ShieldCheck,
    category: 'security',
    color: ['#10b981', '#059669'],
    isAvailable: true,
    keywords: ['nettoyer', 'sanitize', 'sécuriser', 'javascript', 'liens'],
  },
  {
    slug: 'remove-blanks',
    name: 'Supprimer pages blanches',
    description: 'Détectez et supprimez automatiquement les pages vides de votre PDF.',
    icon: FileX,
    category: 'optimize',
    color: ['#f97316', '#ea580c'],
    isAvailable: true,
    keywords: ['pages blanches', 'vides', 'supprimer', 'blank pages'],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getAvailableTools(): Tool[] {
  return tools.filter((t) => t.isAvailable);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim();
  if (!q) return tools;
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords?.some((k) => k.includes(q))
  );
}

export default tools;
