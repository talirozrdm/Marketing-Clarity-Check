import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מה באמת עוצר את השיווק שלך? | טלי רוזנברג",
  description: "אבחון שיווקי קצר שיעזור לך לזהות את צוואר הבקבוק המרכזי בעסק ולהבין במה להתמקד עכשיו.",
  icons: { icon: "/tali-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="he" dir="rtl"><body>{children}</body></html>;
}
