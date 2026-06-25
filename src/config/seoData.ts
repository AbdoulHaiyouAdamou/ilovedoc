import { getToolBySlug, Tool } from './tools';

export interface SEOInfo {
  title: string;
  description: string;
  keywords: string[];
  faq: { question: string; answer: string }[];
  steps: { name: string; text: string }[];
}

const siteName = 'iLoveDoc';

// Explicit SEO data for primary high-traffic tools
const customSEOData: Record<string, Omit<SEOInfo, 'keywords'>> = {
  'merge-pdf': {
    title: 'Fusionner PDF en Ligne - 100% Privé & Gratuit',
    description: 'Fusionnez et combinez plusieurs fichiers PDF en un seul document en ligne. Traitement local sans aucun upload sur serveur pour une vie privée garantie.',
    faq: [
      {
        question: 'Comment fusionner plusieurs fichiers PDF ?',
        answer: 'Glissez-déposez vos fichiers PDF dans la zone de dépôt, ajustez leur ordre à l\'aide des boutons monter/descendre, puis cliquez sur "Fusionner les PDF" pour télécharger le résultat.'
      },
      {
        question: 'Est-ce gratuit de fusionner des PDF sur iLoveDoc ?',
        answer: 'Oui, l\'outil de fusion PDF est 100% gratuit, illimité et ne nécessite aucune inscription.'
      },
      {
        question: 'Mes fichiers PDF fusionnés sont-ils sécurisés ?',
        answer: 'Absolument. Le traitement est effectué localement dans votre navigateur web via JavaScript. Vos documents ne sont jamais transférés sur aucun serveur.'
      }
    ],
    steps: [
      { name: 'Ajouter les fichiers', text: 'Sélectionnez ou glissez-déposez vos documents PDF dans la zone de dépôt.' },
      { name: 'Organiser l\'ordre', text: 'Triez les fichiers selon vos préférences pour définir l\'ordre des pages final.' },
      { name: 'Lancer la fusion', text: 'Cliquez sur le bouton "Fusionner les PDF" pour démarrer l\'assemblage local.' },
      { name: 'Télécharger le PDF', text: 'Récupérez instantanément votre fichier PDF fusionné en cliquant sur Télécharger.' }
    ]
  },
  'split-pdf': {
    title: 'Diviser PDF en Ligne - Extraire des Pages',
    description: 'Séparez un fichier PDF ou extrayez des pages spécifiques gratuitement. Traitement rapide, sécurisé et local dans votre navigateur.',
    faq: [
      {
        question: 'Comment diviser un fichier PDF en plusieurs parties ?',
        answer: 'Importez votre document PDF, sélectionnez les plages de pages à extraire ou divisez le fichier à intervalles réguliers, puis validez pour générer les nouveaux fichiers.'
      },
      {
        question: 'Puis-je extraire une seule page d\'un long PDF ?',
        answer: 'Oui, l\'outil d\'extraction de pages vous permet de sélectionner précisément les pages que vous souhaitez conserver pour créer un nouveau document.'
      },
      {
        question: 'La division de PDF est-elle sécurisée pour mes données ?',
        answer: 'Vos données restent totalement privées. L\'opération s\'exécute localement sur votre appareil sans téléversement externe.'
      }
    ],
    steps: [
      { name: 'Déposer le PDF', text: 'Glissez le fichier PDF à diviser dans la zone de traitement.' },
      { name: 'Définir les plages', text: 'Saisissez les numéros de pages ou sélectionnez les intervalles de division.' },
      { name: 'Diviser le document', text: 'Cliquez sur le bouton pour découper le PDF instantanément.' },
      { name: 'Enregistrer les fichiers', text: 'Téléchargez l\'archive ZIP contenant vos fichiers PDF séparés.' }
    ]
  },
  'compress-pdf': {
    title: 'Compresser PDF en Ligne - Réduire Taille PDF',
    description: 'Réduisez la taille de vos fichiers PDF en ligne sans perte de qualité. Compression rapide, sécurisée et locale dans votre navigateur.',
    faq: [
      {
        question: 'Comment réduire le poids d\'un fichier PDF ?',
        answer: 'Déposez votre document PDF lourd dans notre outil, choisissez le niveau de compression souhaité et téléchargez la version compressée en quelques secondes.'
      },
      {
        question: 'La compression diminue-t-elle la lisibilité des textes ?',
        answer: 'Non, nos algorithmes optimisent les images et suppriment les métadonnées inutiles tout en conservant une netteté de lecture maximale pour le texte.'
      },
      {
        question: 'Quelle est la taille maximale acceptée pour compresser ?',
        answer: 'Puisque le traitement s\'effectue en local dans la mémoire de votre navigateur, vous pouvez compresser des fichiers volumineux (jusqu\'à 100 Mo ou plus selon votre appareil).'
      }
    ],
    steps: [
      { name: 'Sélectionner le PDF', text: 'Importez votre document PDF volumineux depuis votre disque local.' },
      { name: 'Choisir la compression', text: 'Sélectionnez le niveau d\'optimisation requis (légère, moyenne ou forte).' },
      { name: 'Optimiser le document', text: 'Lancez la compression locale en cliquant sur le bouton d\'action.' },
      { name: 'Récupérer le PDF', text: 'Téléchargez votre PDF allégé, prêt pour un envoi par e-mail.' }
    ]
  },
  'pdf-to-word': {
    title: 'Convertir PDF en Word Gratuit - Éditer PDF',
    description: 'Convertissez vos fichiers PDF en documents Word (.docx) modifiables en ligne. Traitement local rapide et sécurisé.',
    faq: [
      {
        question: 'Comment convertir un PDF en document Word modifiable ?',
        answer: 'Importez votre fichier PDF et notre outil convertira la structure, les textes et les tableaux en un fichier Word .docx éditable.'
      },
      {
        question: 'Est-il possible d\'éditer le Word généré ?',
        answer: 'Oui, le document de sortie est entièrement compatible avec Microsoft Word, Google Docs et LibreOffice, vous permettant de modifier le texte librement.'
      },
      {
        question: 'Mes documents confidentiels sont-ils protégés ?',
        answer: 'Oui. Le convertisseur fonctionne entièrement dans le bac à sable de votre navigateur. Vos données confidentielles ne quittent jamais votre ordinateur.'
      }
    ],
    steps: [
      { name: 'Ajouter le PDF', text: 'Déposez le document PDF à convertir sur notre interface.' },
      { name: 'Lancer la conversion', text: 'Cliquez sur "Convertir en Word" pour lancer l\'analyse et l\'extraction locale.' },
      { name: 'Générer le document', text: 'Patientez le temps que le moteur reconstruise le document au format Office.' },
      { name: 'Télécharger le Word', text: 'Enregistrez le fichier .docx éditable sur votre ordinateur.' }
    ]
  },
  'word-to-pdf': {
    title: 'Convertir Word en PDF en Ligne - Gratuit',
    description: 'Transformez vos fichiers Word (.doc, .docx) en documents PDF de haute qualité. Simple, rapide et 100% sécurisé.',
    faq: [
      {
        question: 'Comment convertir un document Word en PDF ?',
        answer: 'Glissez votre document Word (.docx ou .doc) dans l\'outil et téléchargez-le converti au format PDF standard instantanément.'
      },
      {
        question: 'La mise en page originale est-elle préservée ?',
        answer: 'Oui, notre moteur de rendu veille à conserver fidèlement les polices, les marges et la disposition de votre document Word initial.'
      },
      {
        question: 'Puis-je l\'utiliser sur mon smartphone ?',
        answer: 'Absolument. iLoveDoc fonctionne sur tous les navigateurs mobiles modernes sur iOS et Android.'
      }
    ],
    steps: [
      { name: 'Déposer le document', text: 'Sélectionnez votre fichier Word (.docx) à convertir.' },
      { name: 'Lancer l\'opération', text: 'Cliquez sur le bouton de conversion vers le format PDF.' },
      { name: 'Calcul du rendu', text: 'Le script compile la structure du texte et des images localement.' },
      { name: 'Télécharger le PDF', text: 'Récupérez votre document PDF final parfaitement formaté.' }
    ]
  },
  'pdf-to-jpg': {
    title: 'Convertir PDF en JPG - Extraire les Images',
    description: 'Convertissez chaque page de votre PDF en image JPG haute résolution ou extrayez toutes les photos intégrées.',
    faq: [
      {
        question: 'Comment transformer un PDF en images JPG ?',
        answer: 'Importez votre PDF, choisissez l\'option "Pages entières en JPG" et récupérez toutes les pages converties sous forme d\'images individuelles.'
      },
      {
        question: 'Quelle est la qualité des images JPG générées ?',
        answer: 'Les images sont exportées avec une haute densité de pixels pour garantir une lisibilité optimale des petits caractères et des détails.'
      },
      {
        question: 'Puis-je extraire uniquement les images contenues dans le PDF ?',
        answer: 'Oui, notre outil propose également une option pour isoler et extraire uniquement les photos intégrées dans le fichier.'
      }
    ],
    steps: [
      { name: 'Importer le PDF', text: 'Sélectionnez le document PDF à exporter en images.' },
      { name: 'Choisir le mode', text: 'Sélectionnez la conversion de pages complètes ou l\'extraction brute des images.' },
      { name: 'Convertir localement', text: 'Activez la conversion instantanée pour générer les images.' },
      { name: 'Télécharger le ZIP', text: 'Récupérez vos images réunies dans une archive ZIP pratique.' }
    ]
  },
  'jpg-to-pdf': {
    title: 'Convertir JPG en PDF - Fusionner vos Images',
    description: 'Convertissez et assemblez vos photos JPG ou PNG en un seul fichier PDF de haute qualité. Facile et sécurisé.',
    faq: [
      {
        question: 'Comment convertir une ou plusieurs images JPG en un PDF ?',
        answer: 'Déposez vos images JPG dans la zone de dépôt, organisez-les selon l\'ordre souhaité et cliquez sur "Convertir en PDF" pour les fusionner.'
      },
      {
        question: 'Les images sont-elles compressées lors de la conversion ?',
        answer: 'Vous pouvez ajuster les marges et l\'orientation pour optimiser la mise en page sans dégrader la résolution de vos photos.'
      },
      {
        question: 'Quels formats d\'images sont pris en charge ?',
        answer: 'L\'outil accepte les formats JPG, JPEG, PNG, WebP et GIF pour créer votre document PDF final.'
      }
    ],
    steps: [
      { name: 'Déposer les images', text: 'Importez vos fichiers JPG ou PNG dans la zone de téléchargement.' },
      { name: 'Ajuster les options', text: 'Définissez l\'orientation des pages, la taille des marges et l\'ordre des images.' },
      { name: 'Compiler le PDF', text: 'Cliquez sur le bouton pour générer le document PDF localement.' },
      { name: 'Télécharger le fichier', text: 'Récupérez votre document PDF contenant toutes vos images.' }
    ]
  },
  'unlock-pdf': {
    title: 'Déverrouiller PDF - Enlever Mot de Passe PDF',
    description: 'Supprimez le mot de passe et déverrouillez le chiffrement de vos fichiers PDF protégés en ligne. Sécurisé et sans inscription.',
    faq: [
      {
        question: 'Comment déverrouiller un PDF protégé par mot de passe ?',
        answer: 'Importez le document PDF protégé. Si le fichier possède un verrou de lecture, saisissez son mot de passe pour générer une version déverrouillée définitivement.'
      },
      {
        question: 'Puis-je déverrouiller un PDF si j\'ai oublié le mot de passe ?',
        answer: 'Pour les documents fortement chiffrés (norme AES), le mot de passe propriétaire ou utilisateur est requis. Notre outil supprime la saisie obligatoire pour vos prochaines ouvertures.'
      },
      {
        question: 'Est-il légal de déverrouiller un fichier PDF ?',
        answer: 'Oui, à condition que vous soyez le propriétaire légitime du document ou que vous ayez l\'autorisation explicite d\'accéder à son contenu.'
      }
    ],
    steps: [
      { name: 'Ajouter le PDF', text: 'Déposez votre document PDF chiffré dans l\'outil.' },
      { name: 'Fournir le mot de passe', text: 'Entrez le mot de passe du document si le système le demande.' },
      { name: 'Déverrouiller', text: 'Cliquez sur "Déverrouiller le PDF" pour déchiffrer le document en local.' },
      { name: 'Enregistrer le PDF', text: 'Téléchargez la copie de votre PDF désormais libre de droits d\'accès.' }
    ]
  },
  'protect-pdf': {
    title: 'Protéger PDF - Chiffrer vos Fichiers en Ligne',
    description: 'Sécurisez vos documents PDF avec un mot de passe fort et un chiffrement AES. Protection rapide et 100% locale.',
    faq: [
      {
        question: 'Comment sécuriser un fichier PDF avec un mot de passe ?',
        answer: 'Importez votre PDF, définissez votre mot de passe secret dans la barre latérale, confirmez-le et lancez le chiffrement pour protéger le fichier.'
      },
      {
        question: 'Quel type de chiffrement est utilisé pour la sécurité ?',
        answer: 'Nous utilisons des algorithmes de chiffrement standardisés pour assurer que le mot de passe soit requis sur n\'importe quelle visionneuse PDF.'
      },
      {
        question: 'Le mot de passe protège-t-il également contre l\'impression ?',
        answer: 'Oui, vous pouvez chiffrer le document pour empêcher l\'ouverture, l\'édition ou l\'impression non autorisées.'
      }
    ],
    steps: [
      { name: 'Importer le PDF', text: 'Sélectionnez le document PDF que vous souhaitez sécuriser.' },
      { name: 'Entrer un mot de passe', text: 'Définissez un mot de passe fort dans la zone de configuration latérale.' },
      { name: 'Chiffrer le fichier', text: 'Appliquez la protection par mot de passe en cliquant sur "Protéger".' },
      { name: 'Télécharger le PDF', text: 'Récupérez votre document PDF sécurisé, désormais crypté.' }
    ]
  },
  'ai-pdf-translate': {
    title: 'Traduire PDF avec l\'IA - Traduction Gratuite',
    description: 'Traduisez vos documents PDF dans plus de 100 langues grâce à l\'IA. Conservez la mise en page originale.',
    faq: [
      {
        question: 'Comment traduire un document PDF dans une autre langue ?',
        answer: 'Déposez votre PDF, sélectionnez la langue cible dans le menu de configuration, puis laissez notre intelligence artificielle traduire le texte.'
      },
      {
        question: 'La mise en page du PDF est-elle conservée après traduction ?',
        answer: 'Oui, l\'outil s\'efforce de remplacer le texte d\'origine par la traduction aux mêmes coordonnées géométriques pour préserver l\'aspect visuel.'
      },
      {
        question: 'Quelles langues sont prises en charge ?',
        answer: 'Toutes les principales langues internationales sont disponibles (Français, Anglais, Espagnol, Allemand, Chinois, Arabe, etc.).'
      }
    ],
    steps: [
      { name: 'Déposer le PDF', text: 'Téléchargez le document PDF que vous désirez traduire.' },
      { name: 'Choisir la langue', text: 'Sélectionnez la langue d\'origine (ou détection auto) et la langue de destination.' },
      { name: 'Traduire par IA', text: 'Lancez le traitement linguistique intelligent en ligne.' },
      { name: 'Récupérer le PDF', text: 'Téléchargez le fichier PDF traduit contenant la nouvelle version textuelle.' }
    ]
  },
  'ai-pdf-summary': {
    title: 'Résumé IA de PDF - Synthèse Automatique de Documents',
    description: 'Obtenez un résumé intelligent et structuré de vos longs fichiers PDF grâce à l\'IA. Rapide et gratuit.',
    faq: [
      {
        question: 'Comment résumer automatiquement un long document PDF ?',
        answer: 'Chargez votre fichier PDF dans l\'outil. L\'intelligence artificielle analysera la structure et rédigera une synthèse claire des points clés.'
      },
      {
        question: 'Puis-je résumer des fichiers PDF de plusieurs centaines de pages ?',
        answer: 'Oui, l\'algorithme de traitement gère les longs rapports, livres blancs et documents académiques pour en extraire l\'essentiel.'
      },
      {
        question: 'Le résumé généré est-il fiable ?',
        answer: 'L\'IA extrait directement les informations du texte d\'origine pour éliminer les risques d\'hallucination et garantir une synthèse fidèle.'
      }
    ],
    steps: [
      { name: 'Charger le document', text: 'Importez votre document PDF d\'analyse dans le système.' },
      { name: 'Lancer l\'IA', text: 'Activez l\'analyse pour extraire la structure sémantique du texte.' },
      { name: 'Générer la synthèse', text: 'Visualisez les points clés et le résumé rédigé automatiquement par l\'IA.' },
      { name: 'Exporter le résumé', text: 'Téléchargez la synthèse récapitulative au format PDF ou texte.' }
    ]
  },
  'ai-pdf-chat': {
    title: 'Chatter avec un PDF - Poser vos Questions à l\'IA',
    description: 'Discutez avec vos documents PDF en ligne. Posez des questions à l\'IA et obtenez des réponses sourcées instantanément.',
    faq: [
      {
        question: 'Comment chatter et poser des questions à un document PDF ?',
        answer: 'Déposez votre document PDF, puis saisissez vos questions dans le chat. L\'IA analysera le document et répondra avec précision en citant les sources.'
      },
      {
        question: 'Peut-on utiliser le chat sur des rapports financiers ou juridiques ?',
        answer: 'Tout à fait. C\'est l\'outil idéal pour interroger des contrats complexes ou des rapports financiers d\'entreprises.'
      },
      {
        question: 'L\'IA conserve-t-elle mes documents en mémoire ?',
        answer: 'Vos données sont temporaires et utilisées uniquement durant votre session active de discussion pour répondre à vos questions.'
      }
    ],
    steps: [
      { name: 'Déposer le PDF', text: 'Importez le fichier PDF avec lequel vous voulez interagir.' },
      { name: 'Ouvrir la discussion', text: 'Accédez à l\'interface de chat intuitive à côté de la prévisualisation.' },
      { name: 'Poser vos questions', text: 'Saisissez vos questions relatives aux chapitres ou données du PDF.' },
      { name: 'Obtenir les réponses', text: 'Lisez les explications détaillées rédigées instantanément par l\'IA.' }
    ]
  },
  'edit-metadata': {
    title: 'Modifier Métadonnées PDF en Ligne - Gratuit & Sécurisé',
    description: 'Modifiez ou supprimez les métadonnées de vos fichiers PDF (Auteur, Titre, Mots-clés). Traitement 100% local et respectueux de la vie privée.',
    faq: [
      { question: 'Comment modifier l\'auteur d\'un PDF ?', answer: 'Ouvrez votre PDF dans notre outil, allez dans le champ "Auteur" et modifiez le texte, puis cliquez sur Mettre à jour.' },
      { question: 'Est-ce que mes données sont sécurisées ?', answer: 'Absolument, toutes les modifications sont appliquées localement sur votre ordinateur. Vos documents ne sont jamais transférés.' }
    ],
    steps: [
      { name: 'Ouvrir le PDF', text: 'Importez votre fichier PDF dans l\'interface de l\'outil.' },
      { name: 'Éditer les données', text: 'Modifiez le titre, le créateur, l\'auteur ou les mots-clés.' },
      { name: 'Sauvegarder', text: 'Cliquez sur le bouton de mise à jour pour appliquer les changements.' },
      { name: 'Télécharger', text: 'Récupérez votre PDF mis à jour.' }
    ]
  },
  'pdf-info': {
    title: 'Lire Propriétés et Informations PDF en Ligne',
    description: 'Affichez les propriétés cachées, polices, version et informations internes de n\'importe quel fichier PDF instantanément dans votre navigateur.',
    faq: [
      { question: 'Comment voir les métadonnées cachées ?', answer: 'Il suffit de glisser-déposer votre PDF, l\'outil extraira instantanément toutes les données invisibles (date de création, outil utilisé, etc.).' },
      { question: 'L\'outil est-il gratuit ?', answer: 'Oui, vous pouvez analyser les propriétés de tous vos PDF gratuitement.' }
    ],
    steps: [
      { name: 'Sélectionner le PDF', text: 'Glissez-déposez le document à analyser.' },
      { name: 'Analyse locale', text: 'L\'outil lit instantanément la structure du fichier.' },
      { name: 'Visualiser les infos', text: 'Parcourez les métadonnées, polices et propriétés détectées.' },
      { name: 'Fermer', text: 'Aucun téléchargement n\'est nécessaire.' }
    ]
  },
  'add-stamp': {
    title: 'Ajouter un Tampon sur PDF en Ligne - Filigrane & Cachet',
    description: 'Appliquez un tampon personnalisé, un cachet "Approuvé" ou un filigrane sur vos documents PDF en un clic.',
    faq: [
      { question: 'Peut-on ajouter un tampon sur toutes les pages ?', answer: 'Oui, vous pouvez choisir d\'appliquer le tampon sur la première page ou sur l\'ensemble du document.' },
      { question: 'Quels formats d\'images sont acceptés ?', answer: 'Vous pouvez uploader des PNG (avec transparence) ou des JPG pour votre tampon.' }
    ],
    steps: [
      { name: 'Charger le document', text: 'Importez le PDF que vous souhaitez tamponner.' },
      { name: 'Configurer le tampon', text: 'Ajoutez une image ou choisissez un tampon prédéfini.' },
      { name: 'Ajuster la position', text: 'Placez le tampon à l\'endroit souhaité.' },
      { name: 'Appliquer', text: 'Validez pour générer le PDF tamponné.' }
    ]
  },
  'add-attachments': {
    title: 'Ajouter Pièces Jointes au PDF en Ligne',
    description: 'Incorporez des fichiers et pièces jointes directement à l\'intérieur de votre document PDF.',
    faq: [
      { question: 'Est-il possible de joindre n\'importe quel fichier ?', answer: 'Oui, vous pouvez embarquer des images, du texte, du code ou d\'autres PDF à l\'intérieur de votre fichier.' },
      { question: 'Les pièces jointes augmentent-elles la taille du PDF ?', answer: 'Oui, la taille de votre PDF inclura le poids du document principal et de toutes les pièces jointes.' }
    ],
    steps: [
      { name: 'Importer le PDF', text: 'Ouvrez le fichier PDF principal.' },
      { name: 'Ajouter les fichiers', text: 'Sélectionnez les pièces jointes à embarquer.' },
      { name: 'Fusionner', text: 'L\'outil encapsule les fichiers dans la structure du PDF.' },
      { name: 'Télécharger', text: 'Récupérez le PDF enrichi.' }
    ]
  },
  'extract-images': {
    title: 'Extraire Images d\'un PDF en Ligne - Sauvegarde HQ',
    description: 'Extrayez automatiquement toutes les images et photos contenues dans un PDF en haute qualité (JPG/PNG).',
    faq: [
      { question: 'La qualité des images est-elle préservée ?', answer: 'Oui, les images sont extraites dans leur format et résolution d\'origine, sans compression supplémentaire.' },
      { question: 'Comment récupérer les images extraites ?', answer: 'Une fois l\'extraction terminée, toutes les images sont compilées dans un fichier ZIP pour faciliter le téléchargement.' }
    ],
    steps: [
      { name: 'Déposer le PDF', text: 'Importez le document contenant les images.' },
      { name: 'Extraction locale', text: 'L\'outil analyse le PDF pour trouver tous les éléments graphiques.' },
      { name: 'Prévisualisation', text: 'Visualisez le nombre d\'images détectées.' },
      { name: 'Télécharger le ZIP', text: 'Récupérez une archive contenant toutes les photos.' }
    ]
  },
  'remove-images': {
    title: 'Supprimer Images d\'un PDF - Alléger le Fichier',
    description: 'Enlevez toutes les images d\'un fichier PDF pour réduire sa taille et ne conserver que le texte.',
    faq: [
      { question: 'Pourquoi supprimer les images d\'un PDF ?', answer: 'Cela permet de réduire drastiquement la taille du fichier ou d\'optimiser le document pour l\'impression de texte seul.' },
      { question: 'Le texte est-il altéré ?', answer: 'Non, seul le contenu visuel rasterisé (photos) est supprimé, le texte et la mise en page vectorielle restent intacts.' }
    ],
    steps: [
      { name: 'Ajouter le fichier', text: 'Importez le PDF lourd.' },
      { name: 'Lancer le nettoyage', text: 'L\'outil cible et supprime toutes les images.' },
      { name: 'Vérification', text: 'Vérifiez la nouvelle taille allégée du fichier.' },
      { name: 'Sauvegarder', text: 'Téléchargez le document PDF épuré.' }
    ]
  },
  'multi-page-layout': {
    title: 'Imprimer Plusieurs Pages sur une Feuille PDF',
    description: 'Modifiez la mise en page de votre PDF pour regrouper 2, 4 ou 8 pages sur une seule feuille (N-up). Idéal pour l\'impression.',
    faq: [
      { question: 'Comment imprimer 4 pages sur une seule ?', answer: 'Il suffit de sélectionner l\'option "4 pages par feuille" dans l\'outil et de générer le nouveau PDF.' },
      { question: 'Peut-on ajuster les marges ?', answer: 'L\'outil redimensionne automatiquement les pages originales en conservant leur ratio pour les faire rentrer dans la nouvelle mise en page.' }
    ],
    steps: [
      { name: 'Sélectionner le PDF', text: 'Uploadez votre document standard.' },
      { name: 'Choisir la grille', text: 'Sélectionnez 2, 4 ou plus de pages par feuille.' },
      { name: 'Réorganisation', text: 'L\'outil réduit et place les pages sur le nouveau gabarit.' },
      { name: 'Télécharger', text: 'Récupérez le document prêt pour l\'impression économique.' }
    ]
  },
  'overlay-pdf': {
    title: 'Superposer PDF en Ligne - Ajouter En-tête / Papier à lettre',
    description: 'Superposez facilement un document PDF sur un autre. Idéal pour appliquer un fond de page, un logo ou du papier à en-tête.',
    faq: [
      { question: 'Comment ajouter un papier à en-tête sur un PDF ?', answer: 'Uploadez votre PDF de contenu en premier, puis uploadez le PDF du papier à en-tête en tant que couche (overlay).' },
      { question: 'Peut-on superposer des PDF de tailles différentes ?', answer: 'Les documents sont centrés par défaut, il est préférable d\'utiliser des pages de même taille (A4).' }
    ],
    steps: [
      { name: 'PDF Principal', text: 'Ajoutez le document contenant le texte.' },
      { name: 'PDF de Fond', text: 'Ajoutez le PDF contenant le logo ou l\'en-tête.' },
      { name: 'Fusion par couche', text: 'L\'outil superpose les deux documents.' },
      { name: 'Télécharger', text: 'Obtenez votre PDF avec papier à en-tête intégré.' }
    ]
  },
  'sanitize-pdf': {
    title: 'Nettoyer PDF en Ligne - Supprimer Données Sensibles',
    description: 'Purgez votre PDF de toutes ses données cachées, métadonnées, annotations et scripts pour garantir votre confidentialité.',
    faq: [
      { question: 'Qu\'est-ce qu\'un nettoyage de PDF ?', answer: 'C\'est l\'action de supprimer toutes les informations invisibles (auteur, outil de création, code JavaScript caché) pour éviter les fuites de données.' },
      { question: 'Est-ce que cela modifie l\'apparence du document ?', answer: 'Le contenu visuel de base reste exactement le même, seules les données sous-jacentes sont effacées.' }
    ],
    steps: [
      { name: 'Sélectionner', text: 'Importez le PDF à anonymiser.' },
      { name: 'Nettoyage', text: 'Suppression automatique des métadonnées et annotations.' },
      { name: 'Vérification', text: 'Le fichier est restructuré sans traces cachées.' },
      { name: 'Télécharger', text: 'Récupérez la version sécurisée.' }
    ]
  },
  'remove-blanks': {
    title: 'Supprimer Pages Blanches PDF en Ligne',
    description: 'Détectez et supprimez automatiquement toutes les pages vides ou blanches de votre document PDF.',
    faq: [
      { question: 'Comment l\'outil détecte-t-il les pages blanches ?', answer: 'Il scanne le contenu vectoriel et raster de chaque page. Si aucune donnée imprimable n\'est trouvée, la page est ciblée.' },
      { question: 'Est-il possible d\'annuler une suppression ?', answer: 'Le traitement ne modifie pas votre fichier original, il crée un nouveau fichier PDF.' }
    ],
    steps: [
      { name: 'Charger le fichier', text: 'Importez le document comportant des erreurs de scan.' },
      { name: 'Analyse', text: 'L\'outil détecte instantanément les pages vides.' },
      { name: 'Suppression', text: 'Les pages sans contenu sont retirées.' },
      { name: 'Télécharger le résultat', text: 'Récupérez le document nettoyé de ses espaces vides.' }
    ]
  }
};

// Programmatic fallback generator for all 36 tools
export function getSEOData(slug: string): SEOInfo {
  const tool = getToolBySlug(slug);
  
  // Base metadata defaults
  const defaults: SEOInfo = {
    title: 'Outils PDF en Ligne Gratuits - iLoveDoc',
    description: 'Fusionnez, compressez, convertissez et éditez vos fichiers PDF gratuitement avec les outils en ligne rapides et sécurisés de iLoveDoc.',
    keywords: ['PDF', 'outils PDF', 'iLoveDoc', 'PDF gratuit', 'traiter PDF'],
    faq: [
      {
        question: 'Est-ce que cet outil est gratuit ?',
        answer: 'Oui, l\'intégralité des outils de iLoveDoc est gratuite, sans frais cachés et sans inscription.'
      },
      {
        question: 'Mes fichiers sont-ils protégés ?',
        answer: 'Vos documents sont traités localement dans votre navigateur web. Ils ne sont jamais envoyés ni stockés sur un serveur tiers.'
      },
      {
        question: 'Sur quels appareils cet outil fonctionne-t-il ?',
        answer: 'iLoveDoc fonctionne sur tous les ordinateurs, tablettes et smartphones disposant d\'un navigateur web moderne.'
      }
    ],
    steps: [
      { name: 'Sélectionner vos fichiers', text: 'Glissez-déposez vos fichiers PDF ou cliquez pour les charger.' },
      { name: 'Paramétrer les options', text: 'Ajustez les options spécifiques dans le panneau latéral si nécessaire.' },
      { name: 'Lancer l\'opération', text: 'Cliquez sur le bouton de traitement pour lancer l\'outil instantanément.' },
      { name: 'Télécharger le résultat', text: 'Récupérez votre document final après traitement 100% local.' }
    ]
  };

  if (!tool) {
    return defaults;
  }

  // If we have custom detailed SEO data, use it
  const custom = customSEOData[slug];
  const toolName = tool.name;
  const toolDesc = tool.description;

  // Keyword generation
  const keywords = [
    ...(tool.keywords ?? []),
    toolName.toLowerCase(),
    'pdf',
    'en ligne',
    'gratuit',
    'iLoveDoc',
    'sécurisé'
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  if (custom) {
    return {
      title: `${custom.title} | ${siteName}`,
      description: custom.description,
      keywords,
      faq: custom.faq,
      steps: custom.steps
    };
  }

  // Smart fallback generator for other tools
  // Respecting Title <= 60 chars and Description <= 155 chars
  let generatedTitle = `${toolName} - 100% Privé & Gratuit`;
  if (generatedTitle.length > 50) {
    generatedTitle = `${toolName} - Privé & Gratuit`;
  }
  generatedTitle = `${generatedTitle} | ${siteName}`;

  let generatedDesc = `${toolDesc} Outil en ligne 100% gratuit et privé. Traitement local sans upload sur nos serveurs.`;
  if (generatedDesc.length > 155) {
    generatedDesc = `${toolDesc} Gratuit et 100% privé dans votre navigateur.`;
  }
  if (generatedDesc.length > 155) {
    generatedDesc = generatedDesc.substring(0, 152) + '...';
  }

  const generatedFaq = [
    {
      question: `Comment utiliser l'outil ${toolName} ?`,
      answer: `Glissez-déposez vos documents dans la zone de dépôt de la page ${toolName}, réglez les paramètres requis et cliquez sur le bouton d'action.`
    },
    {
      question: `L'outil ${toolName} est-il sécurisé ?`,
      answer: `Oui, le traitement de l'outil ${toolName} est entièrement effectué côté client dans votre propre navigateur. Vos fichiers ne quittent jamais votre poste.`
    },
    {
      question: `Y a-t-il des limites de taille pour ${toolName} ?`,
      answer: `La seule limite dépend de la mémoire de votre appareil car tout se passe localement. La plupart des fichiers de taille standard sont traités en une seconde.`
    }
  ];

  const generatedSteps = [
    { name: 'Sélectionner le document', text: `Glissez-déposez le fichier sur la page de l'outil ${toolName}.` },
    { name: 'Configurer les options', text: 'Spécifiez les valeurs requises selon vos besoins dans le volet.' },
    { name: 'Activer le traitement', text: `Démarrez l'opération locale pour transformer vos pages.` },
    { name: 'Sauvegarder le résultat', text: 'Téléchargez le nouveau fichier généré directement sur votre disque.' }
  ];

  return {
    title: generatedTitle,
    description: generatedDesc,
    keywords,
    faq: generatedFaq,
    steps: generatedSteps
  };
}

export default getSEOData;
