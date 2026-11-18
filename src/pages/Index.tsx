import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PropertiesTable from "@/components/cms/PropertiesTable";
import UsersTable from "@/components/cms/UsersTable";
import { useAuth } from "@/contexts/AuthContext";
import { canManageCmsUsers, normalizeRole, ROLE_LABELS } from "@/lib/roles";

const Index = () => {
  const { user, logout } = useAuth();
  const canManageUsers = canManageCmsUsers(user?.role, user?.verified ?? true);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">CasaFind PH</h1>
              <p className="text-xs text-muted-foreground">Content Management System</p>
            </div>
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-3 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Account menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-semibold text-foreground sm:inline">
                    {user.first_name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                      {ROLE_LABELS[normalizeRole(user.role)]}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="properties" className="gap-2">
              <Building2 className="h-4 w-4" /> Properties
            </TabsTrigger>
            {canManageUsers && (
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" /> Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="properties">
            <PropertiesTable />
          </TabsContent>
          {canManageUsers && (
            <TabsContent value="users">
              <UsersTable />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
