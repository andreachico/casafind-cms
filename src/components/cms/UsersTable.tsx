import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import UserFormDialog from "./UserFormDialog";
import { listUsers, deleteUser, type ApiUser } from "@/lib/usersApi";
import { useAuth } from "@/contexts/AuthContext";
import { canManageCmsUsers } from "@/lib/roles";

type User = ApiUser;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  AGENT: "Agent",
  OWNER: "Owner",
  SEEKER: "Seeker",
};

const getAdminStatus = (user: ApiUser) => {
  if (user.role !== "ADMIN") return "Active";
  return user.verified ? "Verified" : "Pending";
};

const UsersTable = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

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

  const filteredUsers = users?.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.contact_number?.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">{filteredUsers?.length ?? 0} users</p>
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
            ) : filteredUsers?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{search ? "No matching users" : "No users yet"}</TableCell></TableRow>
            ) : (
              filteredUsers?.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                      {u.role === "ADMIN" && (
                        <Badge variant={u.verified ? "default" : "outline"}>{getAdminStatus(u)}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.contact_number || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editingUser} />
    </div>
  );
};

export default UsersTable;
