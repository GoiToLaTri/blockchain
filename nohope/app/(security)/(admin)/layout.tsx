"use client";

import AdminSidebar from "@/components/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "15rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <AdminSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
