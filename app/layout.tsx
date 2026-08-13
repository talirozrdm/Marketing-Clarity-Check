import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tali-marketing-diagnostic.clickangrow.chatgpt.site"),
  title: "מה באמת מעכב את השיווק שלך עכשיו? | טלי רוזנברג",
  description: "אבחון שיווקי קצר שיעזור לך לזהות את צוואר הבקבוק המרכזי בעסק ולהבין במה להתמקד עכשיו.",
  icons: { icon: "/tali-logo.png" },
  openGraph: {
    title: "מה באמת מעכב את השיווק שלך עכשיו?",
    description: "בדיקת השיווק החכם. אבחון קצר שמזהה את צוואר הבקבוק המרכזי בשיווק שלך.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "מפת בדיקת השיווק החכם" }],
    locale: "he_IL",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "מה באמת מעכב את השיווק שלך עכשיו?", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="he" dir="rtl"><body>{children}</body></html>;
}
