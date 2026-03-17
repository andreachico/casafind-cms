import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
}

interface FormData {
  title: string;
  description: string;
  listing_type: "sale" | "rent";
  price: number;
  room_count: number;
  bathroom_count: number;
  parking_count: number;
  property_size: number | null;
  lot_size: number | null;
}

const PropertyFormDialog = ({ open, onOpenChange, property }: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!property;

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      listing_type: "sale",
      price: 0,
      room_count: 0,
      bathroom_count: 0,
      parking_count: 0,
      property_size: null,
      lot_size: null,
    },
  });

  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description || "",
        listing_type: property.listing_type,
        price: property.price,
        room_count: property.room_count,
        bathroom_count: property.bathroom_count,
        parking_count: property.parking_count,
        property_size: property.property_size,
        lot_size: property.lot_size,
      });
    } else {
      reset({
        title: "",
        description: "",
        listing_type: "sale",
        price: 0,
        room_count: 0,
        bathroom_count: 0,
        parking_count: 0,
        property_size: null,
        lot_size: null,
      });
    }
  }, [property, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        const { error } = await supabase.from("properties").update(data).eq("id", property.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success(isEditing ? "Property updated" : "Property created");
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Property" : "Add Property"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title", { required: true })} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Listing Type</Label>
              <Select value={watch("listing_type")} onValueChange={(v) => setValue("listing_type", v as "sale" | "rent")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price (PHP)</Label>
              <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="room_count">Rooms</Label>
              <Input id="room_count" type="number" {...register("room_count", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="bathroom_count">Bathrooms</Label>
              <Input id="bathroom_count" type="number" {...register("bathroom_count", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="parking_count">Parking</Label>
              <Input id="parking_count" type="number" {...register("parking_count", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property_size">Property Size (sqm)</Label>
              <Input id="property_size" type="number" step="0.01" {...register("property_size", { valueAsNumber: true, setValueAs: (v) => v === "" || v === 0 ? null : Number(v) })} />
            </div>
            <div>
              <Label htmlFor="lot_size">Lot Size (sqm)</Label>
              <Input id="lot_size" type="number" step="0.01" {...register("lot_size", { valueAsNumber: true, setValueAs: (v) => v === "" || v === 0 ? null : Number(v) })} />
            </div>
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

export default PropertyFormDialog;
