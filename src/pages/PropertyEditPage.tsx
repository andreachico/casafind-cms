import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyForm from "@/components/cms/PropertyForm";
import { listProperties } from "@/lib/propertiesApi";

const PropertyEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: properties, isLoading, isError } = useQuery({
    queryKey: ["properties"],
    queryFn: listProperties,
  });

  const isEditing = Boolean(id);
  const property = id ? (properties?.find((p) => p.id === id) ?? null) : null;

  const renderBody = () => {
    if (isEditing && isLoading) {
      return <p className="text-muted-foreground">Loading property…</p>;
    }

    if (isEditing && !isLoading && !property) {
      return (
        <div className="space-y-4">
          <p className="font-medium text-destructive">Property not found</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to properties
          </Button>
        </div>
      );
    }

    if (isError && isEditing) {
      return (
        <div className="space-y-4">
          <p className="font-medium text-destructive">Failed to load property</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to properties
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card p-6">
        <PropertyForm
          property={property}
          onSaved={() => navigate("/")}
          onCancel={() => navigate("/")}
        />
      </div>
    );
  };

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
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to properties
        </Button>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {isEditing ? "Edit Property" : "Add Property"}
        </h2>
        {renderBody()}
      </main>
    </div>
  );
};

export default PropertyEditPage;
