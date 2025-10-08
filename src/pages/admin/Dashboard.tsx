import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, TrendingUp, Users, DollarSign } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    avgRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const services = await api.services.getAll();

      if (services && services.length > 0) {
        const totalServices = services.length;
        const totalReviews = services.reduce((acc: number, s: any) => acc + (s.reviews || 0), 0);
        const avgRating = services.reduce((acc: number, s: any) => acc + (s.rating || 0), 0) / totalServices;

        setStats({
          totalServices,
          avgRating: Number(avgRating.toFixed(1)),
          totalReviews,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    {
      title: "Total Services",
      value: stats.totalServices,
      icon: Briefcase,
      description: "Active services available",
      color: "text-blue-600",
    },
    {
      title: "Average Rating",
      value: stats.avgRating,
      icon: TrendingUp,
      description: "Across all services",
      color: "text-amber-500",
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: Users,
      description: "Customer feedback",
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-12 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Canadian Nexus Admin Panel
        </p>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Card */}
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600">
              Common tasks and shortcuts for managing your services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-700">
              • Navigate to <span className="font-semibold text-blue-600">Manage Services</span> to add, edit, or delete services
            </p>
            <p className="text-sm text-gray-700">
              • Review service ratings and customer feedback
            </p>
            <p className="text-sm text-gray-700">
              • Update service details and pricing
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
