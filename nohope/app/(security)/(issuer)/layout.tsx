import CustomConnectButton from "@/components/custom-connect-button";
import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import IssuerSidebar from "@/components/issuer-sidebar";

export default function IssuerLayout({
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
          <IssuerSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </div>
    );
  
}
