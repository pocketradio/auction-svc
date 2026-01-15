import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Toaster } from "@/components/ui/sonner";
import Logout from "@/components/logout";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <SidebarProvider>
            <div className="flex min-h-screen w-full"> {/* flex row to keep sidebar and mainsection in 2 vertical stacks next to each other.*/}
              <AppSidebar />
              <main className="flex flex-col flex-1 w-full"> {/* this is the section on the right side of the sidebar */}
                <div className="flex">
                  <SidebarTrigger />
                  <ModeToggle />
                  <Logout />
                </div>
                {children}
              </main>
            </div>
          </SidebarProvider>
          <Toaster richColors />
        </ThemeProvider>

      </body>
    </html>
  );
}
