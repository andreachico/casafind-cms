import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createUser, updateUser, type ApiUser, type UserRole } from "@/lib/usersApi";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "CMS Administrator" },
  { value: "AGENT", label: "Real Estate Agent" },
  { value: "OWNER", label: "Condo/Home Owner" },
  { value: "SEEKER", label: "Property Seeker" },
];

type User = ApiUser;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
  contact_number: string;
}

const UserFormDialog = ({ open, onOpenChange, user }: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "SEEKER",
      verified: false,
      contact_number: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: "",
        role: user.role,
        verified: user.verified,
        contact_number: user.contact_number || "",
      });
    } else {
      reset({ first_name: "", last_name: "", email: "", password: "", role: "SEEKER", verified: false, contact_number: "" });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        await updateUser(user.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password || null,
          role: data.role,
          verified: data.role === "ADMIN" ? data.verified : true,
          contact_number: data.contact_number || null,
        });
      } else {
        await createUser({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password,
          role: data.role,
          verified: data.role === "ADMIN" ? data.verified : true,
          contact_number: data.contact_number || null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms_users"] });
      toast.success(isEditing ? "User updated" : "User created");
      onOpenChange(false);
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...register("first_name", { required: true })} />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...register("last_name", { required: true })} />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email", { required: true })} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={watch("role")} onValueChange={(v) => {
              const nextRole = v as UserRole;
              setValue("role", nextRole);
              if (nextRole !== "ADMIN") {
                setValue("verified", true);
              }
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {watch("role") === "ADMIN" && (
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
              <input
                id="verified"
                type="checkbox"
                checked={watch("verified")}
                onChange={(e) => setValue("verified", e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="verified" className="cursor-pointer">Verified admin account</Label>
            </div>
          )}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={isEditing ? "Leave blank to keep unchanged" : ""}
              {...register("password", { required: !isEditing })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Min 8 characters, 1 uppercase, 1 number, 1 special character.
            </p>
          </div>
          <div>
            <Label htmlFor="contact_number">Phone Number</Label>
            <Input id="contact_number" {...register("contact_number")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
