import { Proof } from './i-proof';

export interface SignatureRequest extends Proof {
  fileName?: string;
  fileURL?: string;
  state?: SignatureRequestStateType;
  template?: string;
  vars?: {
    requesterName?: string;
    customMessage?: string;
    fileName?: string;
    signatureProofConfirmedSigneeEmailDisabled?: boolean;
    signFaceToFace?: boolean;
    authenticationSMS?: boolean;
    redirectURL?: string;
    signingURL?: string;
  };
  lang?: string;
  hashToSign?: string;
  activation?: number;
  deadline?: number;
  dataURL?: string;
  maxSignatures?: number;
  testMode?: boolean;
  authorizedSignees?: Array<AuthorizedSignee>;
  anchors?: Array<AnchorId>;
  ordered?: boolean;
  auditEvents?: Array<AuditEvent>;
  auditTrailAnchorId?: string;
  auditTrailData?: string;
  attestationAnchorId?: string;
  proofBundleComplete?: boolean;
}

export interface AuthorizedSignee {
  id?: string;
  email?: string;
  vars?: any;
  lang?: string;
  pubKey?: string;
  device?: string;
  countryCallingCode?: string;
  phone?: string;
  signedOn?: number;
  requiresOTP?: boolean;
  signsFaceToFace?: boolean;
  commonName?: string; // ex: John Doe
  identityURL?: string;
  anchorId?: string;
  auditTrailId?: string;
  feedbackSubject?: string;
  feedbackMessage?: string;
}

export interface AuditEvent {
  date: number;
  type: AuditEventType;
  actor?: string;
  comment?: string;
  signatureRequestId?: string;
  fileName?: string;
}

export interface ParametersForWIDSSignature {
  hashToSign?: string;
  messageToSign?: string;
  userId?: string;
  customUserId?: string;
  pubKey?: string;
  path?: string;
  identityToSign?: string;
}

interface AnchorId {
  id: string;
}

export type SignatureRequestStateType =
  | 'DRAFT'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELED'
  | 'EXPIRED';

export type AuditEventType =
  // Transition events
  | 'ACTIVATED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CLOSED'
  | 'CANCELED'

  // Authentication events
  | 'EMAIL_SENT'
  | 'SIGNEE_AUTH'
  | 'OTP_SENT'
  | 'OTP_AUTH'

  // Signature events
  | 'SIGN'
  | 'DELEGATE'

  // Signer events
  | 'DATA_VERIFIED'
  | 'DATA_REVIEWED'
  | 'TCU_ACCEPTED'
  | 'TCU_REFUSED'
  | 'SIGN_ACCEPTED'
  | 'SIGN_REFUSED'

  // Other events
  | 'FEEDBACK'
  | 'TX_SENT';
