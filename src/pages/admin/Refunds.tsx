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
  RefreshCw,
  Filter,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Refund {
  _id: string;
  paymentId: string;
  userEmail: string;
  serviceId: number;
  serviceTitle: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  notes?: string;
  stripeRefundId?: string;
  createdAt: string;
  updatedAt: string;
}

const Refunds = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await api.admin.refunds.getAll();
      if (response.success) {
        setRefunds(response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Error fetching refunds");
    }
    setLoading(false);
  };

  const updateRefundStatus = async (refundId: string, newStatus: string, notes?: string) => {
    try {
      const response = await api.admin.refunds.updateStatus(refundId, newStatus, notes);
      if (response.success) {
        toast.success(`Refund status updated to ${newStatus}`);
        fetchRefunds();
      }
    } catch (error: any) {
      toast.error(error.message || "Error updating refund status");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRefunds = filterStatus === "all"
    ? refunds
    : refunds.filter(refund => refund.status.toLowerCase() === filterStatus);

  const refundStats = {
    total: refunds.length,
    approved: refunds.filter(r => r.status.toLowerCase() === 'approved').length,
    pending: refunds.filter(r => r.status.toLowerCase() === 'pending').length,
    rejected: refunds.filter(r => r.status.toLowerCase() === 'rejected').length,
    totalAmount: refunds
      .filter(r => ['approved', 'completed'].includes(r.status.toLowerCase()))
      .reduce((sum, r) => sum + r.amount, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading refunds...</p>
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
            <h1 className="text-4xl font-bold text-gray-900">Refund Management</h1>
            <p className="mt-2 text-gray-600">
              Review and process refund requests from users
            </p>
          </div>
          <Button
            onClick={fetchRefunds}
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
              <CardTitle className="text-sm font-medium text-gray-700">Total Refunds</CardTitle>
              <MessageCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{refundStats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{refundStats.approved}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{refundStats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{refundStats.rejected}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Refunded Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${(refundStats.totalAmount / 100).toFixed(2)}
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
              All ({refunds.length})
            </Button>
            <Button
              variant={filterStatus === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("approved")}
              className="text-xs bg-green-600 hover:bg-green-700"
            >
              Approved ({refundStats.approved})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
              className="text-xs bg-amber-600 hover:bg-amber-700"
            >
              Pending ({refundStats.pending})
            </Button>
            <Button
              variant={filterStatus === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("rejected")}
              className="text-xs bg-red-600 hover:bg-red-700"
            >
              Rejected ({refundStats.rejected})
            </Button>
          </div>
        </div>

        {/* Refunds List */}
        <div className="grid gap-6">
          {filteredRefunds.map((refund) => (
            <Card key={refund._id} className="border-gray-200 hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(refund.status)}
                    <div>
                      <CardTitle className="text-lg text-gray-900">
                        {refund.serviceTitle}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Service ID: {refund.serviceId} | Payment ID: {refund.paymentId}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(refund.status)}
                    className="px-3 py-1 text-xs font-medium"
                  >
                    {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="text-sm font-medium text-gray-900">{refund.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${(refund.amount / 100).toFixed(2)} {refund.currency.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Request Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="text-sm font-medium text-gray-900 truncate" title={refund.reason}>
                        {refund.reason.length > 20 ? `${refund.reason.substring(0, 20)}...` : refund.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason Details */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Reason:</span> {refund.reason}
                  </p>
                </div>

                {/* Action Buttons */}
                {refund.status.toLowerCase() === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() => updateRefundStatus(refund._id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve Refund
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const notes = prompt('Enter rejection reason (optional):');
                        updateRefundStatus(refund._id, 'rejected', notes || undefined);
                      }}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject Refund
                    </Button>
                  </div>
                )}

                {/* Status Notes */}
                {refund.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Admin Notes:</p>
                    <p className="text-sm text-gray-700 bg-amber-50 p-2 rounded border-l-4 border-amber-200">
                      {refund.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                  <span>Refund ID: {refund._id}</span>
                  {refund.stripeRefundId && <span>Stripe ID: {refund.stripeRefundId}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRefunds.length === 0 && (
          <Card className="col-span-full border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {filterStatus === "all" ? "No Refund Requests" : `No ${filterStatus} Refunds`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filterStatus === "all"
                    ? "Refund requests from users will appear here for review."
                    : `No refund requests found with ${filterStatus} status.`
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

export default Refunds;
