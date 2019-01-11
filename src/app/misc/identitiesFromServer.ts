export interface PubKeyAddress {
  key: string;
  address: string;
}

export interface PubKeyAddressGroup {
  user: string;
  pubKeyAddress: PubKeyAddress[];
}
