import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface DeliveryPerformance {
  total_deliveries: number;
  on_time_deliveries: number;
  late_deliveries: number;
  on_time_percentage: number;
  average_delivery_time_hours: number;
}

export interface RouteEfficiency {
  driver_id: string;
  driver_name: string;
  deliveries_count: number;
  average_delivery_time_hours: number;
  on_time_percentage: number;
}

export interface DeliveryStatusDistribution {
  pending: number;
  assigned: number;
  in_transit: number;
  delivered: number;
  cancelled: number;
}

/**
 * Get delivery performance metrics
 */
export async function getDeliveryPerformance(
  period?: { startDate?: string; endDate?: string }
): Promise<DeliveryPerformance> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('deliveries')
    .select('id, status, scheduled_date, delivered_at')
    .eq('status', 'delivered');

  if (period?.startDate) {
    query = query.gte('scheduled_date', period.startDate);
  }
  if (period?.endDate) {
    query = query.lte('scheduled_date', period.endDate);
  }

  const { data: deliveries, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch deliveries: ${error.message}`);
  }

  let totalDeliveries = 0;
  let onTimeDeliveries = 0;
  let lateDeliveries = 0;
  let totalDeliveryTime = 0;

  (deliveries || []).forEach((delivery: any) => {
    if (!delivery.scheduled_date || !delivery.delivered_at) return;

    totalDeliveries += 1;

    const scheduledDate = new Date(delivery.scheduled_date);
    const deliveredAt = new Date(delivery.delivered_at);
    const deliveryTime = (deliveredAt.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60); // hours

    totalDeliveryTime += deliveryTime;

    // Consider on-time if delivered within 2 hours of scheduled time
    if (deliveryTime <= 2 && deliveryTime >= -1) {
      onTimeDeliveries += 1;
    } else if (deliveryTime > 2) {
      lateDeliveries += 1;
    } else {
      // Early delivery (within 1 hour) is also considered on-time
      onTimeDeliveries += 1;
    }
  });

  const averageDeliveryTime = totalDeliveries > 0 ? totalDeliveryTime / totalDeliveries : 0;
  const onTimePercentage = totalDeliveries > 0 ? Math.round((onTimeDeliveries / totalDeliveries) * 100) : 0;

  return {
    total_deliveries: totalDeliveries,
    on_time_deliveries: onTimeDeliveries,
    late_deliveries: lateDeliveries,
    on_time_percentage: onTimePercentage,
    average_delivery_time_hours: Math.round(averageDeliveryTime * 100) / 100,
  };
}

/**
 * Get average delivery time
 */
export async function getAverageDeliveryTime(
  startDate?: string,
  endDate?: string
): Promise<number> {
  const performance = await getDeliveryPerformance({ startDate, endDate });
  return performance.average_delivery_time_hours;
}

/**
 * Get route efficiency metrics
 */
export async function getRouteEfficiency(
  period?: { startDate?: string; endDate?: string }
): Promise<RouteEfficiency[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('deliveries')
    .select(`
      id,
      driver_id,
      status,
      scheduled_date,
      delivered_at,
      drivers (
        id,
        name
      )
    `)
    .eq('status', 'delivered');

  if (period?.startDate) {
    query = query.gte('scheduled_date', period.startDate);
  }
  if (period?.endDate) {
    query = query.lte('scheduled_date', period.endDate);
  }

  const { data: deliveries, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch deliveries: ${error.message}`);
  }

  const driverMap = new Map<string, {
    driver_id: string;
    driver_name: string;
    deliveries: Array<{ scheduled_date: string; delivered_at: string }>;
  }>();

  (deliveries || []).forEach((delivery: any) => {
    const driver = delivery.drivers;
    if (!driver || !delivery.scheduled_date || !delivery.delivered_at) return;

    const driverId = driver.id;
    if (!driverMap.has(driverId)) {
      driverMap.set(driverId, {
        driver_id: driverId,
        driver_name: driver.name || 'Unknown Driver',
        deliveries: [],
      });
    }

    driverMap.get(driverId)!.deliveries.push({
      scheduled_date: delivery.scheduled_date,
      delivered_at: delivery.delivered_at,
    });
  });

  const efficiency: RouteEfficiency[] = [];

  driverMap.forEach((data, driverId) => {
    const deliveriesCount = data.deliveries.length;
    let totalTime = 0;
    let onTimeCount = 0;

    data.deliveries.forEach((delivery) => {
      const scheduledDate = new Date(delivery.scheduled_date);
      const deliveredAt = new Date(delivery.delivered_at);
      const deliveryTime = (deliveredAt.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60); // hours

      totalTime += deliveryTime;

      if (deliveryTime <= 2 && deliveryTime >= -1) {
        onTimeCount += 1;
      } else if (deliveryTime > 2) {
        // Late
      } else {
        // Early (within 1 hour) is also on-time
        onTimeCount += 1;
      }
    });

    const averageTime = deliveriesCount > 0 ? totalTime / deliveriesCount : 0;
    const onTimePercentage = deliveriesCount > 0 ? Math.round((onTimeCount / deliveriesCount) * 100) : 0;

    efficiency.push({
      driver_id: driverId,
      driver_name: data.driver_name,
      deliveries_count: deliveriesCount,
      average_delivery_time_hours: Math.round(averageTime * 100) / 100,
      on_time_percentage: onTimePercentage,
    });
  });

  return efficiency.sort((a, b) => b.deliveries_count - a.deliveries_count);
}

/**
 * Get delivery status distribution
 */
export async function getDeliveryStatusDistribution(): Promise<DeliveryStatusDistribution> {
  const adminSupabase = getSupabaseAdmin();

  const { data: deliveries, error } = await adminSupabase
    .from('deliveries')
    .select('status');

  if (error) {
    throw new Error(`Failed to fetch deliveries: ${error.message}`);
  }

  const distribution: DeliveryStatusDistribution = {
    pending: 0,
    assigned: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
  };

  (deliveries || []).forEach((delivery: any) => {
    const status = delivery.status || 'pending';
    if (status in distribution) {
      distribution[status as keyof DeliveryStatusDistribution] += 1;
    }
  });

  return distribution;
}

