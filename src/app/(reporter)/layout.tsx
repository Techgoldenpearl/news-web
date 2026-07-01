import { ReporterAuthProvider } from "@/lib/reporter-auth-context";

export default function ReporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReporterAuthProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </ReporterAuthProvider>
  );
}
