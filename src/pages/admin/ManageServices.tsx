import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import ServiceDialog from "@/components/ServiceDialog";
import { api } from "@/lib/api";

export interface Service {
  _id?: string;
  serviceId: number;
  title: string;
  category: string;
  description: string;
  aboutService: string;
  price: string;
  duration: string;
  rating: number;
  reviews: number;
  consultant: string;
  consultantTitle: string;
  features: string[];
  icon: string;
}

const ManageServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.admin.services.getAll();
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Error fetching services");
    }
    setLoading(false);
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await api.admin.services.delete(serviceId);
      if (response.success) {
        toast.success("Service deleted successfully");
        fetchServices();
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting service");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (shouldRefresh: boolean) => {
    setDialogOpen(false);
    setEditingService(null);
    if (shouldRefresh) {
      fetchServices();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-12 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Manage Services</h1>
            <p className="mt-2 text-gray-600">
              Add, edit, or remove settlement services
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingService(null);
              setDialogOpen(true);
            }}
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Service
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.serviceId} className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 bg-white">
            <CardHeader className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-800">{service.title}</CardTitle>
                  <CardDescription className="mt-2 text-sm font-medium text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
                    {service.category}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-800">{service.rating}</span>
                <span className="text-sm text-gray-600">
                  ({service.reviews} reviews)
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                {service.description}
              </p>
              <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <span className="text-xl font-bold text-blue-600">
                    {service.price}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <span className="text-sm font-semibold text-gray-700">
                    {service.duration}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(service)}
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(service.serviceId)}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="col-span-full border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Services Yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first settlement service.
              </p>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Service
              </Button>
            </div>
            </CardContent>
          </Card>
        )}

        <ServiceDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          service={editingService}
        />
      </div>
    </div>
  );
};

export default ManageServices;
