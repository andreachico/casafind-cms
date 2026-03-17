import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CmsUser = Database["public"]["Tables"]["cms_users"]["Row"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CmsUser | null;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone_number: string;
}

const UserFormDialog = ({ open, onOpenChange, user }: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password_hash: "",
      phone_number: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password_hash: user.password_hash,
        phone_number: user.phone_number || "",
      });
    } else {
      reset({ first_name: "", last_name: "", email: "", password_hash: "", phone_number: "" });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        phone_number: data.phone_number || null,
      };
      if (isEditing) {
        const { error } = await supabase.from("cms_users").update(payload).eq("id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cms_users").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms_users"] });
      toast.success(isEditing ? "User updated" : "User created");
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong"),
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
            <Label htmlFor="password_hash">Password Hash</Label>
            <Input id="password_hash" type="text" {...register("password_hash", { required: !isEditing })} placeholder={isEditing ? "Leave unchanged" : ""} />
          </div>
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input id="phone_number" {...register("phone_number")} />
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
