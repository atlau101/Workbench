import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopNavBar from "@/components/layout/TopNavBar";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function InstructorLayout({
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
      <Sidebar role="instructor" />
      <TopNavBar userEmail={user.email ?? ""} />
      <main className="ml-[260px] min-h-screen bg-[var(--color-background)] pt-16">
        <div className="mx-auto max-w-[1200px] px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
