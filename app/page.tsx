
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to NewData</h1>
      <p className="text-lg mb-8">Your intelligent data assistant.</p>
      <a href="/upload" className="text-blue-600 hover:underline">Go to Upload Page →</a>
    </main>
  );
}
