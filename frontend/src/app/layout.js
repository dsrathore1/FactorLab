import "./globals.css";

export const metadata = {
  title: "FactorLab",
  description: "Explore prime factorization algorithms interactively.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
