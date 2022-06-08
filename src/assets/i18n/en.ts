export default {
  title: 'ProofKeeper',
  languages: {
    fr: 'French',
    en: 'English'
  },
  commons: {
    buttons: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      next: 'Next',
      check: 'Check',
      close: 'Close',
      selectKeyFromWids: 'Select a key from Woleet.ID Server',
      skip: 'Skip'
    },
    errors: {
      nameAlreadyPresent: 'Name already present',
      invalidJWTTokenFormat: 'Invalid JWT Token format'
    },
    labelNames: {
      name: 'Name',
      publicKey: 'Public key',
      woleetAPIToken: 'Woleet API Token',
      widsSignatureAPIURL: 'Woleet.ID Server signature API URL',
      widsAPIToken: 'Woleet.ID Server API Token',
      language: 'Language'
    },
    tooltips: {
      giveName: 'Give a name representing the identity of the legal person committing in seal operation.',
      askAdmin: 'Ask the administrator of your Woleet.ID Server for an API token.'
    },
    setupAuthenticationToWoleetAPI: 'Set up authentication to Woleet API'
  },
  folders: {
    tabs: {
      filesToTimestamp: 'Files to timestamp',
      filesToSeal: 'Files to seal',
    },
    errors: {
      folderAlreadyPresent: 'Folder or subfolder already present',
      addAtLeastOneIdentity: 'Please add at least one identity on the settings panel',
      identityRequired: 'Identity required',
      notFound: 'Not found'
    },
    checkbox: {
      makeProofsPublicly: 'Make proofs publicly discoverable by anyone having the file',
      includeFilesFromSubfolders: 'Include files from subfolders',
      recreateProofs: 'Recreate proofs if files are modified',
      deleteOldProofs: 'Delete old proofs if files are modified',
      notCheckSSLCertificate: 'Do not check the SSL certificate of Woleet.ID server (only use in development)'
    },
    identityToUse: 'Identity to use',
    chooseFolder: 'Choose folder',
    folderToScan: 'Folder to scan',
    proveFilesMatchingRegularExpression: 'Only prove files matching this regular expression',
    addFolder: 'Add folder',
    tooltips: {
      notYetStarted: 'Not yet started. Click to restart.',
      executionSuccessful: 'Execution successful. Click to restart.',
      failure: 'Failure. Click to restart.',
      processing: 'Processing',
      deleteFolder: 'Delete folder'
    },
    fixReceipts: 'Fix receipts',
    renameOldReceiptsAndFix: 'Rename old receipts and fix stored receipts if needed',
    updateConfig: 'Update configuration',
    removeFolder: 'Remove folder',
    removeFolderQuestion: 'Are you sure you want to remove this folder from ProofKeeper? Proofs won\'t be deleted and will have to be deleted manually.'
  },
  deeplink: {
    invalidConf: 'Invalid configuration passed by deeplinking',
    pleaseCheck: 'Please check with the one who provided you the link',
    providedWoleetAPIToken: 'Provided Woleet API token:',
    providedWoleetURL: 'Provided Woleet URL:',
    setupAuthenticationToWids: 'Set up authentication to Woleet.ID Server',
    providedWidsAPIToken: 'Provided Woleet.ID Server token:',
    providedWidsURL: 'Provided Woleet.ID Server URL:'
  },
  infos: {
    versions: 'Versions',
    links: 'Links',
    licence: 'Licence'
  },
  logs: {
    logsOfFolder: 'Logs of folder',
    level: 'Level',
    message: 'Message',
    noConfiguredFolders: 'No configured folders'
  },
  settings: {
    overrideWoleetAPIURL: 'Override Woleet API URL',
    addIdentity: 'Add identity:',
    sealIdentities: 'Seal identities:',
    identityUsedInOneFolder: 'This identity is still in use in one of your folder\'s configuration',
    deleteIdentity: 'Delete identity',
    deleteIdentityQuestion: 'Are you sure you want to delete this identity?',
    errors: {
      unableToLogin: 'Unable to login. Please check your token.',
      unableFindFormerKey: 'Unable to find the former key'
    },
    resetSavedFoldersConfig: 'Reset saved folders and configuration',
    resetConfig: 'Reset config',
    resetConfigQuestion: 'Are you sure you want to reset your config? All current settings and configured folders will be removed from ProofKeeper.' 
  },
  wizard: {
    welcome: 'Welcome to ProofKeeper',
    subtitle: 'Timestamp and seal your files dynamically',
    instruction: `Accessing the Woleet API requires an API token.<br>You can create one using your ProofDesk account ("Developer" menu -> "API" tab) or by clicking this`,
    link: 'link',
    setupIdentities: 'Set up identities for seal',
    setupIdentityInstruction: 'If you want ProofKeeper to seal files and create timestamped proofs of seal, you need to configure at least one seal identity (you will be able to add more seal identities using the settings after the wizard):',
    congratulations: 'Congratulations !',
    congratulationSubtitle: 'You can now configure the folders for timestamping and seal.',
    startConfig: 'Start configuration'
  }
};
