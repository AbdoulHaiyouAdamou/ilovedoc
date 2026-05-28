export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
  colors: [string, string]; // Header gradient colors
  content: {
    type: 'paragraph' | 'heading' | 'list' | 'conclusion';
    text?: string;
    items?: string[];
  }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'signatures-numeriques-legales',
    title: "La validité des signatures numériques expliquée : Qu'est-ce qui les rend légales ?",
    subtitle: "Comprendre le cadre légal et la valeur juridique d'une signature de document en ligne.",
    description: "Découvrez ce qui rend une signature numérique juridiquement contraignante, comment les lois varient selon les pays, et comment protéger vos documents en ligne.",
    date: "20 mai 2025",
    category: "Sécurité",
    readTime: "5 min",
    colors: ["#3b82f6", "#1d4ed8"],
    content: [
      {
        type: 'paragraph',
        text: "À l'ère du travail à distance et de la numérisation des processus, signer un document en ligne est devenu un geste quotidien. Mais qu'en est-il de la valeur légale de ces signatures ? Sont-elles équivalentes à une signature manuscrite ? La réponse courte est oui, à condition de respecter certaines règles."
      },
      {
        type: 'heading',
        text: "Qu'est-ce qu'une signature numérique ?"
      },
      {
        type: 'paragraph',
        text: "Une signature numérique (ou électronique) n'est pas un simple scan de votre signature manuscrite. Il s'agit d'un procédé cryptographique qui lie l'identité du signataire au document de façon infalsifiable. Cela garantit deux éléments cruciaux : l'authenticité (qui a signé) et l'intégrité (le document n'a pas été modifié depuis sa signature)."
      },
      {
        type: 'heading',
        text: "Le cadre légal en Europe et dans le monde"
      },
      {
        type: 'paragraph',
        text: "Dans l'Union Européenne, c'est le règlement eIDAS qui encadre les signatures électroniques. Il définit trois niveaux de signature :"
      },
      {
        type: 'list',
        items: [
          "La signature simple (ex: cocher une case ou insérer une image de sa signature). Elle est légale mais sa valeur de preuve est limitée.",
          "La signature avancée, qui requiert des critères d'identification plus stricts et un lien sécurisé avec le signataire.",
          "La signature qualifiée (QES), qui équivaut légalement à 100% à une signature manuscrite et utilise un certificat d'identité vérifié."
        ]
      },
      {
        type: 'heading',
        text: "Pourquoi utiliser iLoveDoc pour vos documents ?"
      },
      {
        type: 'paragraph',
        text: "iLoveDoc vous permet d'ajouter des signatures à vos documents directement dans votre navigateur. Comme aucun fichier n'est téléversé sur nos serveurs, vos informations restent entièrement confidentielles. C'est l'outil parfait pour vos signatures quotidiennes rapides, sécurisées et conformes aux meilleures pratiques du web."
      },
      {
        type: 'conclusion',
        text: "En conclusion, signer numériquement est non seulement légal, mais c'est également beaucoup plus sûr qu'une signature manuscrite papier si vous utilisez les bons outils. Adoptez la signature électronique dès aujourd'hui !"
      }
    ]
  },
  {
    slug: 'fusionner-pdf-et-jpg',
    title: "Comment fusionner des fichiers PDF et JPG dans un seul document (de façon simple)",
    subtitle: "Combinez des fichiers PDF et des images dans un même document — rapidement, facilement, et sans téléchargement.",
    description: "Découvrez comment fusionner des fichiers PDF et des JPG en un seul document avec iLoveDoc. Rapidement, facilement, et directement depuis votre navigateur.",
    date: "20 mai 2025",
    category: "Fusionner",
    readTime: "3 min",
    colors: ["#6366f1", "#4f46e5"],
    content: [
      {
        type: 'paragraph',
        text: "Besoin de fusionner un fichier PDF et une image JPG ? Que vous prépariez un rapport, soumettiez des documents administratifs ou souhaitiez simplement tout regrouper dans un fichier unique, nous allons tout vous expliquer."
      },
      {
        type: 'paragraph',
        text: "Fusionner différents types de fichiers peut sembler compliqué, mais c'est en réalité très simple. Dans ce guide, nous vous expliquons comment procéder avec iLoveDoc — sans téléchargement et de façon très simple."
      },
      {
        type: 'heading',
        text: "Étape 1 : Convertir vos images JPG en PDF"
      },
      {
        type: 'paragraph',
        text: "Avant de fusionner, le plus simple est de convertir vos images JPG au format PDF. Sur iLoveDoc, rendez-vous sur l'outil 'JPG en PDF'. Déposez vos images, ajustez l'orientation ou la marge si nécessaire, et cliquez sur Convertir. Vous obtenez un fichier PDF contenant vos images."
      },
      {
        type: 'heading',
        text: "Étape 2 : Fusionner les deux PDF"
      },
      {
        type: 'paragraph',
        text: "Une fois votre image convertie en PDF, rendez-vous sur l'outil 'Fusionner PDF'. Importez votre document d'origine et le nouveau PDF contenant l'image. Vous pouvez réordonner les fichiers par simple glisser-déposer. Cliquez sur 'Fusionner PDF' pour télécharger le fichier final combiné."
      },
      {
        type: 'conclusion',
        text: "Et voilà ! En deux étapes rapides, entièrement réalisées dans votre navigateur sans risque pour vos données, vous avez fusionné vos fichiers de façon professionnelle."
      }
    ]
  },
  {
    slug: 'modifier-pdf-sans-adobe',
    title: "Puis-je modifier un PDF sans Adobe Acrobat ? Voici comment faire avec iLoveDoc",
    subtitle: "La solution en ligne et 100% gratuite pour éditer vos textes et annotations sans licence onéreuse.",
    description: "Vous devez modifier un PDF mais vous n'avez pas Adobe Acrobat ? Voici comment utiliser iLoveDoc gratuitement, sans téléchargement ni compétences techniques.",
    date: "20 mai 2025",
    category: "Éditer",
    readTime: "4 min",
    colors: ["#7c3aed", "#6d28d9"],
    content: [
      {
        type: 'paragraph',
        text: "Adobe Acrobat est la référence historique pour l'édition de PDF, mais son coût d'abonnement mensuel peut être prohibitif pour des besoins ponctuels. Heureusement, il existe des alternatives modernes et gratuites."
      },
      {
        type: 'heading',
        text: "Pourquoi le format PDF est-il difficile à modifier ?"
      },
      {
        type: 'paragraph',
        text: "Le PDF a été conçu comme un format d'impression numérique figé. Contrairement à un document Word, il ne contient pas de structure de flux de texte fluide, mais plutôt des coordonnées fixes pour chaque caractère. C'est pourquoi l'édition de PDF requiert des outils spécialisés."
      },
      {
        type: 'heading',
        text: "L'outil d'édition iLoveDoc"
      },
      {
        type: 'paragraph',
        text: "Avec l'outil 'Éditer PDF' de iLoveDoc, vous pouvez directement ajouter des zones de texte, dessiner des formes ou insérer des images par-dessus votre PDF. Le processus est exécuté côté client, ce qui garantit une réactivité instantanée et une sécurité optimale."
      },
      {
        type: 'list',
        items: [
          "Ajoutez des annotations claires pour vos collègues.",
          "Masquez des parties de texte inutiles.",
          "Apposez des signatures ou des logos en quelques clics."
        ]
      },
      {
        type: 'conclusion',
        text: "Inutile de dépenser des fortunes dans des licences lourdes. iLoveDoc met à votre disposition tous les outils essentiels gratuitement et sans contrainte."
      }
    ]
  },
  {
    slug: 'reduire-taille-pdf-100ko',
    title: "Comment réduire la taille d'un PDF à moins de 100 Ko",
    subtitle: "Astuces et solutions pour compresser vos documents pour les formulaires administratifs sans dégradation.",
    description: "Besoin d'envoyer un PDF de moins de 100 Ko ? Utilisez l'outil Diviser par taille ou notre compresseur pour réduire vos fichiers sans perte de qualité.",
    date: "20 mai 2025",
    category: "Optimiser",
    readTime: "3 min",
    colors: ["#10b981", "#059669"],
    content: [
      {
        type: 'paragraph',
        text: "De nombreux portails administratifs et scolaires imposent une limite stricte de taille de fichier pour les téléversements (souvent 100 Ko ou 200 Ko). Si votre PDF est trop lourd, pas de panique, il existe plusieurs méthodes simples."
      },
      {
        type: 'heading',
        text: "Méthode 1 : La compression intelligente"
      },
      {
        type: 'paragraph',
        text: "L'outil 'Compresser PDF' de iLoveDoc analyse les images et ressources de votre document et réduit leur résolution sans altérer la lisibilité des textes. C'est la méthode idéale pour conserver l'intégralité du fichier tout en réduisant considérablement son poids."
      },
      {
        type: 'heading',
        text: "Méthode 2 : Supprimer les pages inutiles"
      },
      {
        type: 'paragraph',
        text: "Parfois, le document contient des pages de couverture ou des annexes qui ne sont pas requises. En utilisant l'outil 'Supprimer des pages', vous pouvez alléger le fichier en ne conservant que l'essentiel."
      },
      {
        type: 'conclusion',
        text: "Grâce à notre suite d'outils optimisés, restez sous la barre des 100 Ko et soumettez vos fichiers sans encombre sur tous les sites administratifs !"
      }
    ]
  },
  {
    slug: 'trois-methodes-editer-pdf',
    title: "Trois méthodes d'éditer un PDF",
    subtitle: "Découvrez la méthode qui correspond le mieux à votre besoin.",
    description: "Découvrez les meilleurs moyens de modifier un PDF avec précision à l'aide d'outils en ligne, de la conversion PDF à la modification du contenu du fichier original.",
    date: "13 mars 2024",
    category: "Éditer",
    readTime: "4 min",
    colors: ["#a855f7", "#7c3aed"],
    content: [
      {
        type: 'paragraph',
        text: "La modification d'un PDF peut être abordée de différentes manières selon le résultat souhaité. Voici les trois principales méthodes à retenir."
      },
      {
        type: 'heading',
        text: "Méthode 1 : Édition directe (Annotations et ajouts)"
      },
      {
        type: 'paragraph',
        text: "Idéale pour remplir des formulaires non interactifs, ajouter des remarques ou dessiner sur un plan. Vous pouvez utiliser l'éditeur en ligne de iLoveDoc pour écrire par-dessus les éléments existants."
      },
      {
        type: 'heading',
        text: "Méthode 2 : Conversion en Word"
      },
      {
        type: 'paragraph',
        text: "Si vous devez réécrire des paragraphes entiers ou modifier la structure du document, le mieux est de convertir le PDF en Word. Une fois les modifications faites sur Word, vous pouvez le réexporter en PDF."
      },
      {
        type: 'heading',
        text: "Méthode 3 : Aplatissement et fusion"
      },
      {
        type: 'paragraph',
        text: "Pour verrouiller vos modifications et empêcher d'autres personnes d'éditer les champs, appliquez un aplatissement (flattening) sur votre fichier modifié."
      },
      {
        type: 'conclusion',
        text: "Choisissez la méthode adaptée à votre flux de travail et gagnez en efficacité au quotidien !"
      }
    ]
  },
  {
    slug: 'convertir-jpg-en-word',
    title: "Comment convertir un JPG en Word modifiable",
    subtitle: "Extrayez le texte de vos images pour le rendre éditable en quelques secondes.",
    description: "Apprenez à utiliser les outils de conversion iLoveDoc pour convertir des fichiers image en Word éditables.",
    date: "28 févr. 2024",
    category: "Convertir",
    readTime: "3 min",
    colors: ["#f97316", "#ea580c"],
    content: [
      {
        type: 'paragraph',
        text: "Convertir une image JPG contenant du texte en un fichier Word (.docx) modifiable est indispensable si vous souhaitez réutiliser ou corriger un texte scanné ou photographié."
      },
      {
        type: 'heading',
        text: "Comment fonctionne la reconnaissance de texte ?"
      },
      {
        type: 'paragraph',
        text: "Cette opération fait appel à l'OCR (Reconnaissance Optique de Caractères). L'algorithme analyse les pixels de l'image, identifie les formes des lettres et les convertit en caractères de texte codés numériquement."
      },
      {
        type: 'heading',
        text: "La démarche sur iLoveDoc"
      },
      {
        type: 'paragraph',
        text: "Il suffit de téléverser votre fichier JPG dans l'outil de conversion d'image. Notre outil extrait le contenu textuel et génère un document Word propre que vous pouvez immédiatement ouvrir et éditer dans Word, LibreOffice ou Google Docs."
      },
      {
        type: 'conclusion',
        text: "Gagnez un temps précieux en évitant de retaper manuellement vos documents imprimés !"
      }
    ]
  },
  {
    slug: 'convertir-jpg-en-excel',
    title: "Convertir un JPG en Excel avec ces outils gratuits",
    subtitle: "Récupérez les tableaux de vos images numérisées directement au format Excel.",
    description: "Ce guide vous montrera comment utiliser les outils iLoveDoc pour transformer un JPG en une feuille de calcul Excel modifiable.",
    date: "21 févr. 2024",
    category: "Convertir",
    readTime: "4 min",
    colors: ["#16a34a", "#15803d"],
    content: [
      {
        type: 'paragraph',
        text: "Vous disposez d'un tableau imprimé ou d'une capture d'écran de données chiffrées et vous souhaitez les analyser dans Excel ? Recopier les chiffres un par un est fastidieux et source d'erreurs. Voici la solution."
      },
      {
        type: 'heading',
        text: "Extraction intelligente des lignes et colonnes"
      },
      {
        type: 'paragraph',
        text: "En plus de reconnaître les caractères, l'algorithme d'extraction identifie la structure du tableau (les bordures, les séparations de colonnes et les en-têtes) pour reconstruire fidèlement la grille de calcul."
      },
      {
        type: 'heading',
        text: "Exporter vers Excel"
      },
      {
        type: 'paragraph',
        text: "Glissez-déposez le fichier image sur notre outil de conversion JPG en Excel. La grille de données est recréée et téléchargeable au format .xlsx. Vous pouvez ensuite appliquer vos formules de somme, tris ou graphiques normalement."
      },
      {
        type: 'conclusion',
        text: "Simplifiez-vous la comptabilité et le traitement de données chiffrées grâce à la conversion intelligente de iLoveDoc !"
      }
    ]
  },
  {
    slug: 'reparer-pdf-corrompu',
    title: "Comment réparer un fichier PDF corrompu ou endommagé gratuitement ?",
    subtitle: "Découvrez comment récupérer vos documents PDF illisibles en ligne.",
    description: "Votre fichier PDF refuse de s'ouvrir ? Découvrez comment réparer un PDF corrompu en ligne gratuitement et récupérer vos données sans risque.",
    date: "28 mai 2026",
    category: "Réparer",
    readTime: "4 min",
    colors: ["#f59e0b", "#d97706"],
    content: [
      {
        type: 'paragraph',
        text: "Il n'y a rien de plus frustrant que de recevoir un message d'erreur indiquant qu'un document PDF important est corrompu et ne peut pas être ouvert. Heureusement, il existe des solutions gratuites en ligne pour restaurer vos données."
      },
      {
        type: 'heading',
        text: "Pourquoi un PDF devient-il illisible ?"
      },
      {
        type: 'paragraph',
        text: "Une coupure internet lors du téléchargement, un bug système de votre traitement de texte ou un problème de transfert sur clé USB sont les causes principales de corruption. Dans la plupart des cas, les données internes du document sont intactes, mais l'en-tête du fichier est endommagé."
      },
      {
        type: 'heading',
        text: "La réparation en ligne avec iLoveDoc"
      },
      {
        type: 'paragraph',
        text: "L'outil de réparation iLoveDoc analyse la structure binaire de votre fichier endommagé et reconstruit l'en-tête corrompu en quelques secondes directement dans votre navigateur, garantissant une sécurité absolue."
      },
      {
        type: 'conclusion',
        text: "N'abandonnez pas vos fichiers perdus ! Utilisez le réparateur gratuit pour retrouver l'accès à vos informations instantanément."
      }
    ]
  },
  {
    slug: 'modifier-texte-pdf-gratuit',
    title: "Comment modifier le texte d'un PDF gratuitement et sans logiciel ?",
    subtitle: "Guide pratique pour éditer le texte de vos documents PDF directement en ligne.",
    description: "Guide pratique pour éditer le texte de vos PDF en ligne gratuitement. Modifiez, ajoutez ou supprimez du texte sans installer Adobe Acrobat Pro.",
    date: "28 mai 2026",
    category: "Éditer",
    readTime: "5 min",
    colors: ["#7c3aed", "#6d28d9"],
    content: [
      {
        type: 'paragraph',
        text: "Modifier du texte directement à l'intérieur d'un document PDF est un besoin fréquent, mais les logiciels de bureau comme Acrobat Pro coûtent cher. Nous vous montrons comment contourner cette limite."
      },
      {
        type: 'heading',
        text: "L'éditeur en ligne gratuit d'iLoveDoc"
      },
      {
        type: 'paragraph',
        text: "Grâce à notre outil d'édition en ligne, vous pouvez écrire du texte libre par-dessus le document original, masquer les données confidentielles à l'aide de rectangles opaques ou insérer des images et logos."
      },
      {
        type: 'heading',
        text: "La conversion Word pour les modifications importantes"
      },
      {
        type: 'paragraph',
        text: "Si vous devez réécrire des paragraphes entiers, il est conseillé de convertir d'abord votre PDF au format Word (.docx), d'effectuer les modifications sur votre traitement de texte préféré, puis de le réexporter en PDF."
      },
      {
        type: 'conclusion',
        text: "Modifiez vos documents selon vos besoins en choisissant l'outil d'édition direct ou la conversion Word sur iLoveDoc."
      }
    ]
  },
  {
    slug: 'impression-pdf-caracteres-bizarres',
    title: "Pourquoi mon PDF s'imprime avec des caractères bizarres ? (Résolu)",
    subtitle: "Corriger les hiéroglyphes, symboles et bugs de polices lors de l'impression PDF.",
    description: "Votre imprimante sort des feuilles remplies de symboles étranges, hiéroglyphes ou carrés ? Découvrez comment corriger ce problème d'impression PDF.",
    date: "28 mai 2026",
    category: "Aide",
    readTime: "3 min",
    colors: ["#ef4444", "#dc2626"],
    content: [
      {
        type: 'paragraph',
        text: "Il arrive parfois que l'impression d'un document PDF génère une suite de symboles incompréhensibles ou de carrés blancs à la place des lettres originales. Ce problème est lié aux polices de caractères."
      },
      {
        type: 'heading',
        text: "Un problème de polices non incorporées"
      },
      {
        type: 'paragraph',
        text: "Si le créateur du PDF n'a pas inclus (incorporé) les polices dans le fichier, votre imprimante tente de les remplacer. Si elle ne trouve pas d'équivalent, elle imprime des hiéroglyphes."
      },
      {
        type: 'heading',
        text: "La solution universelle : Aplatir ou imprimer en image"
      },
      {
        type: 'paragraph',
        text: "Pour résoudre ce bug, cochez l'option 'Imprimer en tant qu'image' dans les options de votre visionneuse, ou passez le fichier dans l'outil 'Aplatir PDF' de iLoveDoc avant de lancer l'impression."
      },
      {
        type: 'conclusion',
        text: "En convertissant les textes vectoriels en formes géométriques fixes (aplatissement), vous garantissez une impression parfaite sur n'importe quel modèle d'imprimante."
      }
    ]
  },
  {
    slug: 'compresser-pdf-sans-perte',
    title: "Comment compresser un PDF sans perte de qualité pour e-mail ?",
    subtitle: "Réduisez le poids de vos fichiers PDF tout en conservant une netteté maximale.",
    description: "Réduisez le poids de vos fichiers PDF pour les envoyer par e-mail sans dégrader la lisibilité. Astuces de compression en ligne 100% gratuites.",
    date: "28 mai 2026",
    category: "Optimiser",
    readTime: "4 min",
    colors: ["#10b981", "#059669"],
    content: [
      {
        type: 'paragraph',
        text: "Les boîtes de réception e-mail rejettent souvent les pièces jointes de plus de 10 ou 20 Mo. Compresser votre PDF est indispensable pour assurer sa livraison."
      },
      {
        type: 'heading',
        text: "Optimisation intelligente vs dégradation brute"
      },
      {
        type: 'paragraph',
        text: "Notre outil de compression n'altère pas les textes. Il cible spécifiquement les images intégrées en adaptant leur résolution (DPI) et supprime les métadonnées obsolètes accumulées au fil des modifications."
      },
      {
        type: 'heading',
        text: "Quel niveau de compression choisir ?"
      },
      {
        type: 'paragraph',
        text: "Nous proposons trois modes : compression forte (pour un fichier ultra-léger), compression recommandée (équilibre idéal) et compression légère (qualité maximale)."
      },
      {
        type: 'conclusion',
        text: "Compressez vos fichiers en local dans votre navigateur en gardant un contrôle total sur le rapport taille/qualité."
      }
    ]
  },
  {
    slug: 'copier-texte-pdf-scanne',
    title: "Comment copier le texte d'un PDF scanné ou d'une image ?",
    subtitle: "Utilisez la reconnaissance optique de caractères (OCR) pour copier du texte.",
    description: "Impossible de sélectionner ou de copier le texte d'un PDF ? Apprenez à transformer un PDF scanné en texte éditable grâce à l'OCR gratuit.",
    date: "28 mai 2026",
    category: "OCR",
    readTime: "4 min",
    colors: ["#06b6d4", "#0891b2"],
    content: [
      {
        type: 'paragraph',
        text: "Si vous ne parvenez pas à surbriller ou copier le texte d'un document, c'est parce qu'il s'agit d'une simple image de document numérisé (scan) ou qu'un verrou de protection empêche la copie."
      },
      {
        type: 'heading',
        text: "Activer la reconnaissance de caractères (OCR)"
      },
      {
        type: 'paragraph',
        text: "L'OCR (Optical Character Recognition) est une technologie qui scanne visuellement les pixels du PDF pour en extraire les mots et les transformer en caractères informatiques indexables."
      },
      {
        type: 'heading',
        text: "La méthode simple sur iLoveDoc"
      },
      {
        type: 'paragraph',
        text: "Déposez votre scan dans notre outil 'OCR PDF'. L'algorithme s'exécute localement pour générer un nouveau PDF entièrement consultable où vous pourrez copier-coller tous les paragraphes."
      },
      {
        type: 'conclusion',
        text: "Convertissez vos scans en documents de travail dynamiques et gagnez un temps précieux au quotidien."
      }
    ]
  },
  {
    slug: 'convertir-pdf-word-mise-en-page',
    title: "Convertir un PDF en Word sans modifier la mise en page",
    subtitle: "Astuces de conversion pour éviter les décalages de textes et tableaux.",
    description: "Marre des tableaux décalés et du texte désaligné lors de vos conversions ? Voici comment convertir un PDF en Word en gardant le format original.",
    date: "28 mai 2026",
    category: "Convertir",
    readTime: "5 min",
    colors: ["#2563eb", "#1d4ed8"],
    content: [
      {
        type: 'paragraph',
        text: "La conversion d'un PDF vers Word génère parfois des lignes de texte superposées ou des tableaux brisés. Ce décalage est dû à l'absence de repères de marges fluides dans le format PDF."
      },
      {
        type: 'heading',
        text: "Choisir un moteur de conversion de haute fidélité"
      },
      {
        type: 'paragraph',
        text: "Le convertisseur d'iLoveDoc analyse la topographie visuelle du document original et recrée une structure de paragraphes et de grilles de tableaux native sous Word pour limiter au maximum les retouches manuelles."
      },
      {
        type: 'heading',
        text: "Astuces pratiques après conversion"
      },
      {
        type: 'paragraph',
        text: "Si vous observez de petits écarts, utilisez la règle de tabulation plutôt que la touche espace pour aligner vos blocs de textes, et vérifiez que les images sont ancrées correctement."
      },
      {
        type: 'conclusion',
        text: "La conversion locale sur iLoveDoc vous offre un document .docx propre et immédiatement prêt pour l'édition."
      }
    ]
  },
  {
    slug: 'mot-de-passe-pdf-oublie',
    title: "Mot de passe PDF perdu : Comment ouvrir un PDF verrouillé ?",
    subtitle: "Les solutions et outils légaux pour débloquer vos fichiers PDF protégés.",
    description: "Vous avez oublié le mot de passe de votre propre document PDF ? Découvrez comment déverrouiller et supprimer la protection d'un PDF légalement.",
    date: "28 mai 2026",
    category: "Sécurité",
    readTime: "4 min",
    colors: ["#16a34a", "#15803d"],
    content: [
      {
        type: 'paragraph',
        text: "Chiffrer un PDF est une bonne idée pour le sécuriser, mais perdre son propre mot de passe d'ouverture bloque l'accès à vos propres rapports officiels ou pièces personnelles."
      },
      {
        type: 'heading',
        text: "Supprimer la restriction d'utilisation"
      },
      {
        type: 'paragraph',
        text: "Pour les restrictions d'édition (mot de passe propriétaire), notre outil 'Déverrouiller PDF' supprime instantanément le verrouillage en local afin de vous rendre les droits de copie et d'impression."
      },
      {
        type: 'heading',
        text: "Que faire pour un mot de passe d'ouverture (chiffrement AES) ?"
      },
      {
        type: 'paragraph',
        text: "Pour ouvrir un document crypté, la clé utilisateur reste obligatoire. Une fois saisie une première fois sur notre plateforme sécurisée, l'outil l'enlève définitivement pour vos prochaines lectures."
      },
      {
        type: 'conclusion',
        text: "Délivrez vos documents des contraintes de saisie répétitives grâce au déverrouillage sécurisé."
      }
    ]
  },
  {
    slug: 'bug-previsualisation-pdf-windows',
    title: "Résoudre le bug du volet de prévisualisation PDF sous Windows",
    subtitle: "Restaurez l'affichage de l'aperçu PDF dans votre Explorateur de fichiers.",
    description: "L'Explorateur Windows n'affiche plus l'aperçu de vos fichiers PDF ou affiche une erreur ? Voici comment réactiver la prévisualisation PDF rapidement.",
    date: "28 mai 2026",
    category: "Aide",
    readTime: "4 min",
    colors: ["#64748b", "#475569"],
    content: [
      {
        type: 'paragraph',
        text: "Le volet de prévisualisation de l'Explorateur Windows est très pratique pour consulter rapidement le sommaire d'un document, mais il arrive régulièrement qu'il se bloque ou affiche un écran noir."
      },
      {
        type: 'heading',
        text: "Pourquoi le volet d'aperçu se bloque-t-il ?"
      },
      {
        type: 'paragraph',
        text: "L'installation ou la mise à jour de visionneuses tierces modifie les liaisons système (handlers). Windows se retrouve alors avec plusieurs moteurs en conflit pour afficher le rendu."
      },
      {
        type: 'heading',
        text: "Comment corriger le problème d'aperçu ?"
      },
      {
        type: 'paragraph',
        text: "Ouvrez les options de dossiers, vérifiez que la case 'Afficher les gestionnaires d'aperçu' est cochée, puis redéfinissez votre lecteur par défaut principal dans les paramètres Windows."
      },
      {
        type: 'conclusion',
        text: "Un système bien configuré fluidifie votre navigation quotidienne au milieu de vos répertoires professionnels."
      }
    ]
  },
  {
    slug: 'signer-pdf-sans-imprimante',
    title: "Comment remplir et signer un document PDF sans imprimante ?",
    subtitle: "Signez vos documents et contrats électroniquement et gratuitement.",
    description: "Plus besoin d'imprimer pour signer ! Découvrez comment remplir un formulaire et ajouter votre signature sur un PDF en ligne gratuitement en 2026.",
    date: "28 mai 2026",
    category: "Signer",
    readTime: "4 min",
    colors: ["#4f46e5", "#4338ca"],
    content: [
      {
        type: 'paragraph',
        text: "Imprimer un contrat, le signer à la main, puis le scanner pour le renvoyer est une perte de temps, de papier et d'encre. Il est aujourd'hui extrêmement simple de le faire de manière 100% numérique."
      },
      {
        type: 'heading',
        text: "La légalité de la signature électronique"
      },
      {
        type: 'paragraph',
        text: "En France et en Europe (règlement eIDAS), les signatures apposées électroniquement ont la même valeur juridique que les signatures papier traditionnelles pour la grande majorité des actes commerciaux."
      },
      {
        type: 'heading',
        text: "Signer sur iLoveDoc en quelques clics"
      },
      {
        type: 'paragraph',
        text: "Importez le contrat, dessinez votre signature sur l'écran tactile ou chargez une photo de celle-ci, et glissez-la au niveau de la ligne d'accord. Le document final est compilé de manière sécurisée sans transit serveur."
      },
      {
        type: 'conclusion',
        text: "Passez au zéro papier et simplifiez la signature de vos devis et contrats professionnels."
      }
    ]
  },
  {
    slug: 'fusionner-pdf-sur-smartphone',
    title: "Comment fusionner et réorganiser des PDF sur smartphone ?",
    subtitle: "Combinez et gérez vos documents PDF directement depuis votre smartphone.",
    description: "Besoin d'assembler des PDF depuis votre téléphone ? Découvrez comment combiner, trier et fusionner des fichiers PDF sur iPhone et Android gratuitement.",
    date: "28 mai 2026",
    category: "Mobile",
    readTime: "3 min",
    colors: ["#0ea5e9", "#0284c7"],
    content: [
      {
        type: 'paragraph',
        text: "L'assemblage de pièces justificatives ou de rapports doit parfois se faire d'urgence en situation de mobilité. Heureusement, votre smartphone suffit largement."
      },
      {
        type: 'heading',
        text: "La fusion mobile sans application externe"
      },
      {
        type: 'paragraph',
        text: "Nul besoin de saturer l'espace de stockage de votre téléphone avec des applications payantes. Accédez au site iLoveDoc depuis votre navigateur mobile (Safari sur iPhone, Chrome sur Android)."
      },
      {
        type: 'heading',
        text: "Glisser-déposer sur écran tactile"
      },
      {
        type: 'paragraph',
        text: "Notre interface tactile réactive vous permet de réordonner les pages en les faisant glisser du bout du doigt, et de compiler les PDF instantanément et de manière 100% sécurisée."
      },
      {
        type: 'conclusion',
        text: "Gérez tous vos flux de documents rapidement, n'importe où, directement depuis le creux de votre main."
      }
    ]
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export default blogPosts;
