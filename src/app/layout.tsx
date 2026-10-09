import "../styles";

export const metadata = { title: "Glypher", description: "Animated Unicode glyph loops" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
