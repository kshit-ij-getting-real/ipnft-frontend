import { Web3Storage, File } from 'web3.storage';

function makeClient() {
  const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_WEB3_STORAGE_TOKEN not set');
  }
  return new Web3Storage({ token });
}

export async function uploadMetadata(metadata: Record<string, unknown>): Promise<string> {
  const client = makeClient();
  const blob = new Blob([JSON.stringify(metadata)], {
    type: 'application/json',
  });
  const files = [new File([blob], 'metadata.json')];
  const cid = await client.put(files);
  return cid;
}

export function cidToUrl(cid: string) {
  return `https://ipfs.io/ipfs/${cid}/metadata.json`;
}
