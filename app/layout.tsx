export const metadata = {
  title: "NewData",
  description: "Upload, clean, and analyze your data easily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
