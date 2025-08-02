import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to NewData</h1>
        <p className="mb-6">Your virtual data analyst assistant</p>
        <div className="flex flex-col space-y-2">
          <Link href="/login" className="text-blue-600 underline">
            Go to Login
          </Link>
          <Link href="/register" className="text-blue-600 underline">
            Go to Register
          </Link>
        </div>
      </div>
    </main>
  );
}
