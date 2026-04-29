import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import SidebarProvider from "@/components/layout/SidebarProvider";
import TopNavBar from "@/components/layout/TopNavBar";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <SidebarProvider>
        <Sidebar role="student" />
        <TopNavBar userEmail={user.email ?? ""} />
        <main className="min-h-screen bg-[var(--color-background)] pt-16 md:ml-[260px]">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
