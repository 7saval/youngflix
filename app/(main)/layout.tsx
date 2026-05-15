import { Navbar } from "@/components/navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className="pt-20">{children}</div>
    </>
  );
}
