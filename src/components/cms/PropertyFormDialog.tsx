import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createProperty, resolveImageUrl, updateProperty, uploadPropertyImage, type ApiProperty } from "@/lib/propertiesApi";

type Property = ApiProperty;

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
  image_url: string;
  detail_image_url: string;
}

const PropertyFormDialog = ({ open, onOpenChange, property }: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!property;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDetailFile, setSelectedDetailFile] = useState<File | null>(null);

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
      image_url: "",
      detail_image_url: "",
    },
  });

  useEffect(() => {
    setSelectedFile(null);
    setSelectedDetailFile(null);

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
        image_url: resolveImageUrl(property.image_url) ?? "",
        detail_image_url: resolveImageUrl(property.detail_image_url) ?? "",
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
        image_url: "",
        detail_image_url: "",
      });
    }
  }, [property, reset]);

  const previewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : (resolveImageUrl(property?.image_url ?? null) ?? watch("image_url")) || "";

  const detailPreviewUrl = selectedDetailFile
    ? URL.createObjectURL(selectedDetailFile)
    : (resolveImageUrl(property?.detail_image_url ?? null) ?? watch("detail_image_url")) || "";

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setValue("image_url", "");
  };

  const handleRemoveDetailImage = () => {
    setSelectedDetailFile(null);
    setValue("detail_image_url", "");
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      let imageUrl = data.image_url.trim() || null;
      let detailImageUrl = data.detail_image_url.trim() || null;

      if (selectedFile) {
        imageUrl = await uploadPropertyImage(selectedFile);
      }

      if (selectedDetailFile) {
        detailImageUrl = await uploadPropertyImage(selectedDetailFile);
      }

      const payload = {
        title: data.title,
        description: data.description,
        listing_type: data.listing_type,
        price: data.price,
        room_count: data.room_count,
        bathroom_count: data.bathroom_count,
        parking_count: data.parking_count,
        property_size: data.property_size,
        lot_size: data.lot_size,
        image_url: imageUrl,
        detail_image_url: detailImageUrl,
      };
      if (isEditing) {
        await updateProperty(property.id, payload);
      } else {
        await createProperty(payload);
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

          <div className="space-y-2">
            <Label htmlFor="image_file">Header Image</Label>
            <Input
              id="image_file"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                if (file) {
                  setValue("image_url", URL.createObjectURL(file));
                }
              }}
            />
            {previewUrl ? (
              <div className="relative overflow-hidden rounded-md border bg-muted/30 p-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-3 z-10 h-7 w-7 rounded-full bg-background/80 text-foreground shadow-sm"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  ×
                </Button>
                <img src={previewUrl} alt="Property preview" className="h-32 w-full rounded object-cover" />
              </div>
            ) : null}
            {(property?.image_url || selectedFile) ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={handleRemoveImage}
              >
                Remove image
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="detail_image_file">View Details Image</Label>
            <Input
              id="detail_image_file"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedDetailFile(file);
                if (file) {
                  setValue("detail_image_url", URL.createObjectURL(file));
                }
              }}
            />
            {detailPreviewUrl ? (
              <div className="relative overflow-hidden rounded-md border bg-muted/30 p-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-3 z-10 h-7 w-7 rounded-full bg-background/80 text-foreground shadow-sm"
                  onClick={handleRemoveDetailImage}
                  aria-label="Remove detail image"
                >
                  ×
                </Button>
                <img src={detailPreviewUrl} alt="Property detail preview" className="h-32 w-full rounded object-cover" />
              </div>
            ) : null}
            {(property?.detail_image_url || selectedDetailFile) ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={handleRemoveDetailImage}
              >
                Remove detail image
              </Button>
            ) : null}
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
