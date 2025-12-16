import { DashboardLayout } from "@starter-saas/ui/dashboard-layout";
import Image from "next/image";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import UserMenu from "@/features/users/components/user-menu";
import { getLocale } from "@/lib/get-locale";

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <DashboardLayout
      sidebarContent={<AppSidebar />}
      sidebarFooter={<UserMenu currentLocale={locale} />}
      sidebarHeader={
        <div className="flex h-8 items-center gap-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <Image
            alt="Logo"
            className="size-8 shrink-0"
            height={32}
            src="/assets/logos/logo-small.png"
            width={32}
          />
          <span className="truncate font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Starter SaaS
          </span>
        </div>
      }
    >
      {children}
    </DashboardLayout>
  );
}
