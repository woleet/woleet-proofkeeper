export default {
  title: 'ProofKeeper',
  commons: {
    buttons: {
      cancel: 'Cancel'
    }
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
      processing: 'Processing'
    },
    fixReceipts: 'Fix receipts',
    renameOldReceiptsAndFix: 'Rename old receipts and fix stored receipts if needed',
    updateConfig: 'Update configuration',
    removeFolder: 'Remove folder',
    removeFolderQuestion: 'Are you sure you want to remove this folder from ProofKeeper? Proofs won\'t be deleted and will have to be deleted manually.'
  }
};
