import { FormEvent, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { uploadMetadata } from '../lib/ipfs';
import { ipnftAbi } from '../lib/ipnftAbi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IPNFT_ADDRESS as `0x${string}`;

export default function CreatePage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: injected() });
  const { disconnect } = useDisconnect();
  const { data: txHash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [title, setTitle] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [institution, setInstitution] = useState('');
  const [category, setCategory] = useState('Biotech');
  const [piName, setPiName] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cid, setCid] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCid(null);

    if (!isConnected || !address) {
      setError('Connect wallet first.');
      return;
    }

    try {
      const metadata = {
        title,
        abstract: abstractText,
        institution,
        category,
        pi_name: piName,
        link,
      };

      const cidValue = await uploadMetadata(metadata);
      setCid(cidValue);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ipnftAbi,
        functionName: 'mint',
        args: [address, `ipfs://${cidValue}/metadata.json`],
      });
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to create IPNFT';
      setError(message);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <h1>Create Research IPNFT</h1>

      <div style={{ marginBottom: '1rem' }}>
        {isConnected ? (
          <div>
            <div>Connected: {address}</div>
            <button onClick={() => disconnect()}>Disconnect</button>
          </div>
        ) : (
          <button onClick={() => connect()}>Connect Wallet</button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input
          required
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          required
          placeholder="Abstract"
          value={abstractText}
          onChange={(e) => setAbstractText(e.target.value)}
          rows={4}
        />
        <input
          required
          placeholder="Institution (e.g. IIT Bombay)"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />
        <input
          required
          placeholder="PI / Lead Researcher"
          value={piName}
          onChange={(e) => setPiName(e.target.value)}
        />
        <input
          placeholder="Paper / preprint / internal link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Biotech</option>
          <option>Materials</option>
          <option>Energy</option>
          <option>Climate</option>
          <option>AI</option>
          <option>Other</option>
        </select>

        <button type="submit" disabled={isPending || isConfirming}>
          {isPending || isConfirming ? 'Minting…' : 'Create IPNFT'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {cid && (
        <div style={{ marginTop: '1rem' }}>
          <div>IPFS CID: {cid}</div>
          <div>
            Metadata URL:{' '}
            <a
              href={`https://ipfs.io/ipfs/${cid}/metadata.json`}
              target="_blank"
              rel="noreferrer"
            >
              View
            </a>
          </div>
        </div>
      )}

      {txHash && (
        <div style={{ marginTop: '1rem' }}>
          <div>Tx hash: {txHash}</div>
          {isSuccess && <div>Mint confirmed.</div>}
        </div>
      )}
    </div>
  );
}
