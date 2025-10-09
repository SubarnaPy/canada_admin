import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  RefreshCw,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Payment {
  _id: string;
  stripePaymentIntentId: string;
  userEmail: string;
  serviceId: number;
  serviceTitle: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.admin.payments.getAll();
      if (response.success) {
        const paymentsData = response.data || [];
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      }
    } catch (error: any) {
      toast.error(error.message || "Error fetching payments");
      setPayments([]); // Set empty array on error
    }
    setLoading(false);
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const response = await api.admin.payments.updateStatus(paymentId, newStatus);
      if (response.success) {
        toast.success(`Payment status updated to ${newStatus}`);
        fetchPayments();
      }
    } catch (error: any) {
      toast.error(error.message || "Error updating payment status");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredPayments = filterStatus === "all"
    ? payments
    : payments.filter(payment => payment.status.toLowerCase() === filterStatus);

  const paymentStats = {
    total: payments.length,
    completed: payments.filter(p => ['completed', 'succeeded'].includes(p.status.toLowerCase())).length,
    pending: payments.filter(p => p.status.toLowerCase() === 'pending').length,
    failed: payments.filter(p => ['failed', 'cancelled'].includes(p.status.toLowerCase())).length,
    totalAmount: payments
      .filter(p => ['completed', 'succeeded'].includes(p.status.toLowerCase()))
      .reduce((sum, p) => sum + p.amount, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
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
            <h1 className="text-4xl font-bold text-gray-900">Payment Management</h1>
            <p className="mt-2 text-gray-600">
              Monitor and manage all service payments
            </p>
          </div>
          <Button
            onClick={fetchPayments}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{paymentStats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paymentStats.completed}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{paymentStats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{paymentStats.failed}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(paymentStats.totalAmount / 100).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="h-4 w-4 text-gray-600" />
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="text-xs"
            >
              All ({payments.length})
            </Button>
            <Button
              variant={filterStatus === "succeeded" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("succeeded")}
              className="text-xs bg-green-600 hover:bg-green-700"
            >
              Completed ({paymentStats.completed})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
              className="text-xs bg-amber-600 hover:bg-amber-700"
            >
              Pending ({paymentStats.pending})
            </Button>
            <Button
              variant={filterStatus === "failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("failed")}
              className="text-xs bg-red-600 hover:bg-red-700"
            >
              Failed ({paymentStats.failed})
            </Button>
          </div>
        </div>

        {/* Payments List */}
        <div className="grid gap-6">
          {filteredPayments.map((payment) => (
            <Card key={payment._id} className="border-gray-200 hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <CardTitle className="text-lg text-gray-900">
                        {payment.serviceTitle}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Service ID: {payment.serviceId}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(payment.status)}
                    className="px-3 py-1 text-xs font-medium"
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="text-sm font-medium text-gray-900">{payment.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Method</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {payment.paymentMethod || 'Stripe'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {payment.status.toLowerCase() === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() => updatePaymentStatus(payment._id, 'succeeded')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updatePaymentStatus(payment._id, 'failed')}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Mark Failed
                    </Button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Payment ID: {payment.stripePaymentIntentId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <Card className="col-span-full border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {filterStatus === "all" ? "No Payments Yet" : `No ${filterStatus} Payments`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filterStatus === "all"
                    ? "Payments will appear here once users start booking services."
                    : `No payments found with ${filterStatus} status.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Payments;
