export const metadata = {
  title: "FactorLab",
  description:
    "A web application for visualizing and comparing different factorization algorithms. Enter a number and select an algorithm to see how it performs in terms of execution time and steps taken.",
    icon: "/favicon.ico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
