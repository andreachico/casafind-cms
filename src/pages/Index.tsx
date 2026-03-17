import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users } from "lucide-react";
import PropertiesTable from "@/components/cms/PropertiesTable";
import UsersTable from "@/components/cms/UsersTable";

const Index = () => {
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="properties" className="gap-2">
              <Building2 className="h-4 w-4" /> Properties
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <PropertiesTable />
          </TabsContent>
          <TabsContent value="users">
            <UsersTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
