import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PropertyFormDialog from "./PropertyFormDialog";
import { listProperties, deleteProperty, type ApiProperty } from "@/lib/propertiesApi";

type Property = ApiProperty;

const PropertiesTable = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [search, setSearch] = useState("");

  const { data: properties, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const errorMessage = error instanceof Error ? error.message : "The server could not be reached.";

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property deleted");
    },
    onError: () => toast.error("Failed to delete property"),
  });

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProperty(null);
    setDialogOpen(true);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(price);

  const filteredProperties = properties?.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q)) || p.listing_type.includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Properties</h2>
          <p className="text-sm text-muted-foreground">
            {isError ? "Data unavailable" : `${filteredProperties?.length ?? 0} listings`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-20">Header Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-center">Rooms</TableHead>
              <TableHead className="text-center">Bath</TableHead>
              <TableHead className="text-center">Parking</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center">
                  <div className="space-y-3">
                    <p className="font-medium text-destructive">Failed to load properties</p>
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    <Button variant="outline" size="sm" onClick={() => void refetch()}>
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProperties?.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{search ? "No matching properties" : "No properties yet"}</TableCell></TableRow>
            ) : (
              filteredProperties?.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="h-12 w-16 rounded object-cover border" />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">No image</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                  <TableCell>
                    <Badge variant={p.listing_type === "sale" ? "default" : "secondary"}>
                      {p.listing_type === "sale" ? "For Sale" : "For Rent"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{formatPrice(p.price)}</TableCell>
                  <TableCell className="text-center">{p.room_count}</TableCell>
                  <TableCell className="text-center">{p.bathroom_count}</TableCell>
                  <TableCell className="text-center">{p.parking_count}</TableCell>
                  <TableCell className="text-sm">
                    {p.property_size ? `${p.property_size} sqm` : "—"}
                    {p.lot_size ? ` / ${p.lot_size} sqm lot` : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(p.id)}>
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

      <PropertyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} property={editingProperty} />
    </div>
  );
};

export default PropertiesTable;
