import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/noto-sans";
import "@fontsource/noto-sans-ethiopic";
import "@fontsource/noto-sans-cherokee";
import "@fontsource/noto-sans-runic";
import "@fontsource/noto-sans-symbols";
import "@fontsource/noto-sans-symbols-2";
import "@fontsource/noto-sans-georgian";
import "@fontsource/noto-sans-ogham";
import "@fontsource/noto-sans-meroitic";
import "./globals.css";

export const metadata = { title: "Glypher", description: "Animated Unicode glyph loops" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
