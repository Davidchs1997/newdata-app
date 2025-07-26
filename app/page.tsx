'use client'
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-analyst.jpg')" }}
    >
      <div className="bg-white bg-opacity-80 rounded-2xl p-10 shadow-xl max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-4">NewData: Your Virtual Data Analyst</h1>
        <p className="text-lg mb-6">
          Upload your data and let our smart assistant clean, analyze, and visualize it like a senior data analyst would.
        </p>
        <Link href="/upload">
          <Button className="text-lg px-6 py-3">Get Started</Button>
        </Link>
      </div>
    </main>
  );
}
