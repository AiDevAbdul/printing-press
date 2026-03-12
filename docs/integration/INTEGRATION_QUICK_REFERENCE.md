# Quick Reference - New Integrations

## Services Quick Start

### 1. Notifications Service
```typescript
import notificationsService from '../../services/notifications.service';

// Get notifications
const response = await notificationsService.getNotifications(10, 0);

// Get unread count
const count = await notificationsService.getUnreadCount();

// Mark as read
await notificationsService.markAsRead(notificationId);

// Mark all as read
await notificationsService.markAllAsRead();

// Delete notification
await notificationsService.deleteNotification(notificationId);
```

### 2. Activity Log Service
```typescript
import activityLogService from '../../services/activity-log.service';

// Get user activity log
const response = await activityLogService.getUserActivityLog(userId, 50, 0);
// Returns: { data: ActivityLog[], total: number, limit: number, offset: number }
```

### 3. Costing Service
```typescript
import costingService from '../../services/costing.service';

// Get configuration
const config = await costingService.getConfig();

// Update configuration
await costingService.updateConfig({
  labor_cost_per_hour: 500,
  machine_cost_per_hour: 1000,
  profit_margin_percentage: 20
});

// Get job costs
const costs = await costingService.getJobCosts(jobId);

// Create job cost
await costingService.createJobCost(jobId, {
  cost_type: 'material',
  description: 'Paper',
  quantity: 100,
  unit_cost: 50
});

// Calculate costs
const calculation = await costingService.calculateJobCost(jobId, {
  pre_press_charges: 1000
});

// Save calculation
await costingService.saveCalculatedCost(jobId, {
  pre_press_charges: 1000
});
```

---

## Component Integration

### Header Notifications
Already integrated in `frontend/src/components/layout/Header.tsx`
- Real-time notification fetching (30-second polling)
- Unread count badge
- Mark as read/delete actions
- Time-ago formatting

### User Profile Activity Log
Already integrated in `frontend/src/pages/profile/UserProfile.tsx`
- Displays recent activity
- Pagination support
- Formatted action names

### Costing Configuration
New admin page: `frontend/src/pages/admin/CostingConfig.tsx`
- Configure labor/machine costs
- Set waste and overhead percentages
- Update profit margin
- Real-time form updates

---

## Routing Setup Required

Add to your admin routes:
```typescript
import CostingConfig from '../pages/admin/CostingConfig';

// In your routes configuration:
{
  path: '/admin/costing-config',
  element: <CostingConfig />,
  requiredRole: 'admin'
}
```

---

## Type Definitions

### Notification
```typescript
interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}
```

### ActivityLog
```typescript
interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
```

### CostingConfig
```typescript
interface CostingConfig {
  id: string;
  labor_cost_per_hour: number;
  machine_cost_per_hour: number;
  material_waste_percentage: number;
  overhead_percentage: number;
  profit_margin_percentage: number;
  updated_at: string;
}
```

---

## Error Handling

All services use standard error handling:
```typescript
try {
  const result = await notificationsService.getNotifications();
} catch (error) {
  console.error('Failed to fetch notifications:', error);
  // Handle error appropriately
}
```

---

## Performance Notes

- **Notification Polling:** 30 seconds (configurable)
- **Activity Log Pagination:** 50 records per page (configurable)
- **Costing Calculations:** Real-time, no caching
- **All services:** Fully async/await compatible

---

## Testing

### Mock Services for Testing
```typescript
// Mock notifications service
jest.mock('../../services/notifications.service', () => ({
  getNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
}));
```

---

## Troubleshooting

### Notifications not appearing
- Check browser console for errors
- Verify API endpoint is accessible
- Check user has notifications in database
- Verify polling interval (30 seconds)

### Activity log empty
- Verify user has activity records
- Check activity log endpoint returns data
- Verify pagination parameters

### Costing config not saving
- Check admin permissions
- Verify all required fields are filled
- Check API response for validation errors
- Verify database connection

---

## Files Summary

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| notifications.service.ts | Service | 50 | Notification management |
| activity-log.service.ts | Service | 30 | Activity log abstraction |
| costing.service.ts | Service | 50 | Costing operations |
| CostingConfig.tsx | Page | 180 | Admin configuration UI |
| Header.tsx | Component | Updated | Notification integration |
| UserProfile.tsx | Page | Updated | Activity log integration |
| Costing.tsx | Page | Updated | Costing service integration |

---

## Next Steps

1. ✅ Services created and tested
2. ✅ Components updated
3. ⏳ Add routing for CostingConfig page
4. ⏳ Run unit tests
5. ⏳ Deploy to staging
6. ⏳ Monitor performance
7. ⏳ Deploy to production
