import EN_Translations from './en';

const fr: typeof EN_Translations = {
  title: 'ProofKeeper',
  languages: {
    fr: 'Français',
    en: 'Anglais'
  },
  commons: {
    buttons: {
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Sauvegarder',
      next: 'Suivant',
      check: 'Vérifier',
      close: 'Fermer',
      selectKeyFromWids: 'Sélectionnez une clé de Woleet.ID Server',
      skip: 'Passer'
    },
    errors: {
      nameAlreadyPresent: 'Nom déjà existant',
      invalidJWTTokenFormat: 'Format de token JWT non valide'
    },
    labelNames: {
      name: 'Nom',
      publicKey: 'Clé publique',
      woleetAPIToken: 'Token d\'API de Woleet',
      widsSignatureAPIURL: 'URL de l\'API de signature de Woleet.ID Server',
      widsAPIToken: 'Token d\'API de Woleet.ID Server',
      language: 'Langue'
    },
    tooltips: {
      giveName: 'Donnez un nom représentant l\'identité de la personne morale qui s\'engage dans l\'opération de scellé.',
      askAdmin: 'Demandez à l\'administrateur de votre Woleet.ID Server un token d\'API.'
    },
    setupAuthenticationToWoleetAPI: 'Configurer l\'authentification à l\'API Woleet',
  },
  folders: {
    tabs: {
      filesToTimestamp: 'Fichiers à horodater',
      filesToSeal: 'Fichiers à sceller'
    },
    errors: {
      folderAlreadyPresent: 'Dossier ou sous-dossier déjà présent',
      addAtLeastOneIdentity: 'Veuillez ajouter au moins une identité dans le panneau de configuration.',
      identityRequired: 'Identité requise',
      notFound: 'Pas trouvé'
    },
    checkbox: {
      makeProofsPublicly: 'Rendre les preuves découvertes publiquement par toute personne possédant le fichier',
      includeFilesFromSubfolders: 'Inclure les fichiers des sous-dossiers',
      recreateProofs: 'Recréer les preuves si les fichiers sont modifiés',
      deleteOldProofs: 'Supprimer les anciennes preuves si les fichiers sont modifiés',
      notCheckSSLCertificate: 'Ne pas vérifier le certificat SSL de Woleet.ID Server (à utiliser uniquement en développement)'
    },
    identityToUse: 'Identité à utiliser',
    chooseFolder: 'Choisir dossier',
    folderToScan: 'Dossier à analyser',
    proveFilesMatchingRegularExpression: 'Ne prouver que les fichiers correspondant à cette expression régulière',
    addFolder: 'Ajouter le dossier',
    tooltips: {
      notYetStarted: 'Pas encore démarré. Cliquez pour redémarrer.',
      executionSuccessful: 'Exécution réussie. Cliquez pour redémarrer.',
      failure: 'Échec. Cliquez pour redémarrer.',
      processing: 'Traitement en cours',
      deleteFolder: 'Supprimer le dossier'
    },
    fixReceipts: 'Correction des reçus',
    renameOldReceiptsAndFix: 'Renommer les anciens reçus et corriger les reçus stockés si nécessaire',
    updateConfig: 'Mettre à jour la configuration',
    removeFolder: 'Supprimer le dossier',
    removeFolderQuestion: 'Êtes-vous sûr de vouloir supprimer ce dossier de ProofKeeper ? Les preuves ne seront pas supprimées et devront l\'être manuellement.'
  },
  deeplink: {
    invalidConf: 'Configuration invalide transmise par deeplinking',
    pleaseCheck: 'Veuillez vérifier auprès de la personne qui vous a fourni le lien.',
    providedWoleetAPIToken: 'Token d\'API fourni par Woleet :',
    providedWoleetURL: 'URL fournie par Woleet :',
    setupAuthenticationToWids: 'Configurer l\'authentification à Woleet.ID Server',
    providedWidsAPIToken: 'Token d\'API fourni par Woleet.ID Server :',
    providedWidsURL: 'URL fournie par Woleet.ID Server :'
  },
  infos: {
    versions: 'Versions',
    links: 'Liens',
    licence: 'Licence'
  },
  logs: {
    logsOfFolder: 'Logs du dossier',
    level: 'Niveau',
    message: 'Message',
    noConfiguredFolders: 'Pas de dossiers configurés'
  },
  settings: {
    overrideWoleetAPIURL: 'Remplacer l\'URL de l\'API Woleet',
    addIdentity: 'Ajouter une identité :',
    sealIdentities: 'Identités de scellé :',
    identityUsedInOneFolder: 'Cette identité est encore utilisée dans la configuration d\'un de vos dossiers.',
    deleteIdentity: 'Supprimer l\'identité',
    deleteIdentityQuestion: 'Êtes-vous sûr de vouloir supprimer cette identité ?',
    errors: {
      unableToLogin: 'Impossible de se connecter. Veuillez vérifier votre token.',
      unableFindFormerKey: 'Impossible de trouver l\'ancienne clé'
    },
    resetSavedFoldersConfig: 'Réinitialiser les dossiers enregistrés et la configuration',
    resetConfig: 'Réinitialiser la configuration',
    resetConfigQuestion: 'Êtes-vous sûr de vouloir réinitialiser votre configuration ? Tous les paramètres actuels et les dossiers configurés seront supprimés de ProofKeeper.' 
  },
  wizard: {
    welcome: 'Bienvenue sur ProofKeeper',
    subtitle: 'Horodater et sceller vos fichiers dynamiquement',
    instruction: `L'accès à l'API Woleet nécessite un token d'API.<br>Vous pouvez en créer un en utilisant votre compte ProofDesk (menu "Developer" -> onglet "API") ou en cliquant sur ce`,
    link: 'lien',
    setupIdentities: 'Configurer les identités pour le scellé',
    setupIdentityInstruction: 'Si vous voulez que ProofKeeper scelle les fichiers et crée des preuves de scellé horodatées, vous devez configurer au moins une identité de scellé (vous pourrez ajouter d\'autres identités de scellé en utilisant les paramètres après l\'assistant) :',
    congratulations: 'Félicitations !',
    congratulationSubtitle: 'Vous pouvez maintenant configurer les dossiers pour l\'horodatage et le scellé.',
    startConfig: 'Démarrer la configuration'
  }
};

export default fr;
