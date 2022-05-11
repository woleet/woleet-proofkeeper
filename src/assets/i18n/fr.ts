import EN_Translations from './en';

const fr: typeof EN_Translations = {
  title: 'ProofKeeper',
  commons: {
    buttons: {
      cancel: 'Annuler'
    }
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
      notCheckSSLCertificate: 'Ne pas vérifier le certificat SSL du serveur Woleet.ID (à utiliser uniquement en développement)'
    },
    identityToUse: 'Identité à utiliser',
    chooseFolder: 'Choisir dossier',
    folderToScan: 'Dossier à analyser',
    proveFilesMatchingRegularExpression: 'Ne prouver que les fichiers correspondant à cette expression régulière',
    addFolder: 'Ajouter dossier',
    tooltips: {
      notYetStarted: 'Pas encore démarré. Cliquez pour redémarrer.',
      executionSuccessful: 'Exécution réussie. Cliquez pour redémarrer.',
      failure: 'Échec. Cliquez pour redémarrer.',
      processing: 'Traitement en cours'
    },
    fixReceipts: 'Correction des reçus',
    renameOldReceiptsAndFix: 'Renommer les anciens reçus et corriger les reçus stockés si nécessaire',
    updateConfig: 'Mettre à jour la configuration',
    removeFolder: 'Supprimer le dossier',
    removeFolderQuestion: 'Êtes-vous sûr de vouloir supprimer ce dossier de ProofKeeper ? Les preuves ne seront pas supprimées et devront l\'être manuellement.'
  }
};

export default fr;
