import { AdvertiserAuthProvider } from "@/lib/advertiser-auth-context";

export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdvertiserAuthProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </AdvertiserAuthProvider>
  );
}
