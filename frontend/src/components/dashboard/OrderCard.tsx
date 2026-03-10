import { motion } from 'framer-motion';
import { useMemo, memo } from 'react';
import { formatDate } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types';

interface OrderCardProps {
  order: Order;
  index: number;
}

function OrderCard({ order, index }: OrderCardProps) {
  const getStatusColor = useMemo(() => {
    return (status: OrderStatus) => {
      switch (status) {
        case OrderStatus.COMPLETED:
          return 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
        case OrderStatus.IN_PRODUCTION:
          return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(0,217,255,0.3)]';
        case OrderStatus.PENDING:
          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(255,214,10,0.3)]';
        case OrderStatus.CANCELLED:
          return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    };
  }, []);

  const getCardGlow = useMemo(() => {
    return (status: OrderStatus) => {
      switch (status) {
        case OrderStatus.COMPLETED:
          return 'hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]';
        case OrderStatus.IN_PRODUCTION:
          return 'hover:shadow-[0_0_30px_rgba(0,217,255,0.4)]';
        case OrderStatus.PENDING:
          return 'hover:shadow-[0_0_30px_rgba(255,214,10,0.4)]';
        case OrderStatus.CANCELLED:
          return 'hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]';
        default:
          return '';
      }
    };
  }, []);

  // Calculate days until delivery
  const daysUntilDelivery = useMemo(() => {
    return Math.ceil(
      (new Date(order.delivery_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [order.delivery_date]);

  const statusColor = useMemo(() => getStatusColor(order.status), [order.status, getStatusColor]);
  const cardGlow = useMemo(() => getCardGlow(order.status), [order.status, getCardGlow]);
  const daysColor = useMemo(() => {
    if (daysUntilDelivery <= 2) return 'text-red-400';
    if (daysUntilDelivery <= 5) return 'text-yellow-400';
    return 'text-green-400';
  }, [daysUntilDelivery]);

  const daysText = useMemo(() => {
    if (daysUntilDelivery > 0) return `${daysUntilDelivery}d left`;
    if (daysUntilDelivery === 0) return 'Today';
    return 'Overdue';
  }, [daysUntilDelivery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`glass-card rounded-xl p-5 transition-all duration-300 cursor-pointer ${cardGlow}`}
      role="article"
      aria-label={`Order ${order.order_number}`}
    >
      {/* Order Number - Large and prominent */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-2xl font-bold text-white font-mono" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {order.order_number}
        </h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Customer & Product */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Customer:</span>
          <span className="text-white text-sm font-medium">{order.customer.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Product:</span>
          <span className="text-cyan-400 text-sm font-medium">{order.product_name}</span>
        </div>
      </div>

      {/* Delivery Date with Countdown */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div>
          <span className="text-gray-400 text-xs">Delivery:</span>
          <span className="text-white text-sm font-mono ml-2">{formatDate(order.delivery_date)}</span>
        </div>
        {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
          <div className={`text-xs font-mono ${daysColor}`}>
            {daysText}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(OrderCard);
