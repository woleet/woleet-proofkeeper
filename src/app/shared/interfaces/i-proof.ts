export interface Proof {
  id?: string;
  created?: number;
  lastModified?: number;
  name?: string;
  hash?: string;
  signedHash?: string;
  signedIdentity?: string;
  signedIssuerDomain?: string;
  pubKey?: string;
  signature?: string;
  identityURL?: string;
  signatureRequestId?: string;
  public?: boolean;
  notifyByEmail?: boolean;
  tags?: Array<string>;
  metadata?: Record<string, unknown>;
  callbackURL?: string;
  status?: ProofStatusType;
  timestamp?: number;
  confirmation?: number;
  txId?: string;
}

export type ProofStatusType = 'WAIT' | 'NEW' | 'SENT' | 'CONFIRMED';
