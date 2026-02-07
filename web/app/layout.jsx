import "./globals.css";

export const metadata = {
  title: "Idealab Print",
  description: "Self printing kiosk MVP"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
