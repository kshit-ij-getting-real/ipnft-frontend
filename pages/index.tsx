import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <h1>IPNFT Demo</h1>
      <p>Minimal frontend for your IPNFT contract on Base Sepolia.</p>
      <ul>
        <li>
          <Link href="/create">Create Research IPNFT</Link>
        </li>
      </ul>
    </div>
  );
}
