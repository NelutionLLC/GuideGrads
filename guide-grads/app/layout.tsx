// app/layout.tsx
import { fontVars } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const allFontVars = Object.values(fontVars).map((f) => f.variable).join(" ");

  return (
    <html lang="en">
      <body className={allFontVars}>
        {children}
      </body>
    </html>
  );
}
