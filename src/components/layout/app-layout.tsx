import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(circle_500px_at_50%_200px,#3e348244,transparent)]"></div>
      </div>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-10 w-10 text-primary">
                <Languages className="h-6 w-6" />
             </Button>
            <h1 className="text-xl font-headline font-semibold">LinguaVerse</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className={cn(
          "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4",
          "md:peer-data-[variant=inset]:hidden"
          )}>
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
