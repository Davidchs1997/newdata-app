import React from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to NewData</h1>
      <p className="text-center max-w-xl text-lg mb-4">
        Upload, clean, and analyze your Excel, CSV or JSON files in seconds. Try it for free or unlock more features with a Pro account.
      </p>
      <Link href="/upload">
        <Button className="text-lg px-6 py-3">Try Now</Button>
      </Link>
    </main>
  );
}
