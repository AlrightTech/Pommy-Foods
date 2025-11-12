import { Badge } from "@/components/ui/Badge";

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'approved':
      return <Badge variant="info">Approved</Badge>;
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'draft':
      return <Badge variant="info">Draft</Badge>;
    case 'rejected':
      return <Badge variant="error">Rejected</Badge>;
    case 'cancelled':
      return <Badge variant="error">Cancelled</Badge>;
    default:
      return <Badge variant="info">{status}</Badge>;
  }
};

