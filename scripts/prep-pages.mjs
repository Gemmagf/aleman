#!/usr/bin/env node
// Strip server-only routes/files so the project can be statically exported
// for GitHub Pages. Run inside CI (or locally on a throwaway tree); destroys
// the source tree.

import { rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const REMOVE = [
  "app/api",
  "app/today",
  "app/history",
  "app/preferences",
  "app/review",
  "app/login",
  "app/signup",
  "app/test",
  "app/offline",
  "proxy.ts",
  "components/Nav.tsx",
  "components/RegisterSW.tsx",
  "lib/supabase",
  "lib/lessonService.ts",
  "lib/generateLesson.ts",
  "lib/levelTest.ts",
];

for (const path of REMOVE) {
  if (existsSync(path)) {
    await rm(path, { recursive: true, force: true });
    console.log(`removed ${path}`);
  }
}

// Replace root layout (drops Nav + RegisterSW imports)
await writeFile(
  "app/layout.tsx",
  `import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aleman — Demo",
  description: "Demo de l'app per aprendre alemany.",
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className={\`\${geistSans.variable} \${geistMono.variable} h-full antialiased\`}>
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
`,
);
console.log("rewrote app/layout.tsx");

// Replace root page with a redirect to /demo
await writeFile(
  "app/page.tsx",
  `import { redirect } from "next/navigation";

export default function Home() {
  redirect("/demo");
}
`,
);
console.log("rewrote app/page.tsx");

console.log("✓ Tree prepared for static export");
