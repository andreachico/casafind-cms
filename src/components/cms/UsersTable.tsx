import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import UserFormDialog from "./UserFormDialog";
import { listUsers, deleteUser, updateUser, type ApiUser } from "@/lib/usersApi";
import { useAuth } from "@/contexts/AuthContext";
import { canManageCmsUsers, normalizeRole, ROLE_LABELS, type CmsRoleGroup } from "@/lib/roles";

type User = ApiUser;

const GROUP_TABS: { value: CmsRoleGroup; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "LISTER", label: "Lister" },
  { value: "SEEKER", label: "Seeker" },
];

const UsersTable = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<CmsRoleGroup>("ADMIN");

  const { data: users, isLoading } = useQuery({
    queryKey: ["cms_users"],
    queryFn: listUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms_users"] });
      toast.success("User deleted");
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: number) => updateUser(id, { verified: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms_users"] });
      toast.success("User verified");
    },
    onError: () => toast.error("Failed to verify user"),
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const canManageUsers = canManageCmsUsers(user?.role, user?.verified ?? true);

  if (!canManageUsers) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Only CMS administrators can view and manage user accounts.
      </div>
    );
  }

  const matchesSearch = (u: User) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.contact_number?.toLowerCase().includes(q)
    );
  };

  const groupCounts = (group: CmsRoleGroup) =>
    users?.filter((u) => normalizeRole(u.role) === group).length ?? 0;

  const renderTable = (group: CmsRoleGroup) => {
    const showVerification = group === "ADMIN" || group === "LISTER";
    const groupUsers = users?.filter(
      (u) => normalizeRole(u.role) === group && matchesSearch(u)
    );

    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : groupUsers?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{search ? "No matching users" : "No users yet"}</TableCell></TableRow>
            ) : (
              groupUsers?.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary">{ROLE_LABELS[normalizeRole(u.role)]}</Badge>
                      {showVerification &&
                        (u.verified ? (
                          <Badge variant="default">Verified</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.contact_number || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {showVerification && !u.verified && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-emerald-600 hover:text-emerald-700"
                          title="Verify user"
                          disabled={verifyMutation.isPending}
                          onClick={() => verifyMutation.mutate(u.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">{users?.length ?? 0} users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CmsRoleGroup)}>
        <TabsList className="mb-6">
          {GROUP_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label} ({groupCounts(t.value)})
            </TabsTrigger>
          ))}
        </TabsList>
        {GROUP_TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {renderTable(t.value)}
          </TabsContent>
        ))}
      </Tabs>

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editingUser} />
    </div>
  );
};

export default UsersTable;
