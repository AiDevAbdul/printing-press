import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async checkSystemAccess(userId: string, module: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    return user.system_access?.includes(module) || false;
  }

  async checkPartialAccess(
    userId: string,
    module: string,
    action: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    const modulePermissions = user.partial_access?.[module];
    return modulePermissions?.includes(action) || false;
  }

  async hasPermission(
    userId: string,
    module: string,
    action?: string,
  ): Promise<boolean> {
    const hasSystemAccess = await this.checkSystemAccess(userId, module);
    if (!hasSystemAccess) return false;

    if (!action) return true;

    return this.checkPartialAccess(userId, module, action);
  }

  async getAvailableModules(): Promise<string[]> {
    return [
      'Dashboard',
      'Orders',
      'Quotations',
      'Production',
      'Quality',
      'Dispatch',
      'Inventory',
      'Invoices',
      'Reports',
      'Settings',
      'User Management',
      'QA Dashboard',
    ];
  }

  async getAvailableActions(): Promise<string[]> {
    return ['view', 'create', 'edit', 'delete', 'approve', 'export', 'assign'];
  }

  async getDefaultPermissionsForRole(role: string): Promise<{
    system_access: string[];
    partial_access: Record<string, string[]>;
  }> {
    const permissionMap = {
      admin: {
        system_access: [
          'Dashboard',
          'Orders',
          'Quotations',
          'Production',
          'Quality',
          'Dispatch',
          'Inventory',
          'Invoices',
          'Reports',
          'Settings',
          'User Management',
          'QA Dashboard',
        ],
        partial_access: {
          Dashboard: ['view'],
          Orders: ['view', 'create', 'edit', 'delete', 'export'],
          Quotations: ['view', 'create', 'edit', 'delete'],
          Production: ['view', 'create', 'edit', 'delete', 'assign'],
          Quality: ['view', 'create', 'edit', 'delete'],
          Dispatch: ['view', 'create', 'edit', 'delete'],
          Inventory: ['view', 'create', 'edit', 'delete'],
          Invoices: ['view', 'create', 'edit', 'delete', 'export'],
          Reports: ['view', 'export'],
          Settings: ['view', 'edit'],
          'User Management': ['view', 'create', 'edit', 'delete'],
          'QA Dashboard': ['view'],
        },
      },
      qa_manager: {
        system_access: ['Dashboard', 'Production', 'Quality', 'QA Dashboard'],
        partial_access: {
          Dashboard: ['view'],
          Production: ['view'],
          Quality: ['view'],
          'QA Dashboard': ['view', 'approve'],
        },
      },
      operator: {
        system_access: ['Dashboard', 'Production'],
        partial_access: {
          Dashboard: ['view'],
          Production: ['view'],
        },
      },
      analyst: {
        system_access: [
          'Dashboard',
          'Orders',
          'Invoices',
          'Inventory',
          'Reports',
        ],
        partial_access: {
          Dashboard: ['view'],
          Orders: ['view', 'export'],
          Invoices: ['view', 'export'],
          Inventory: ['view', 'export'],
          Reports: ['view', 'export'],
        },
      },
      sales: {
        system_access: ['Dashboard', 'Orders', 'Quotations', 'Invoices'],
        partial_access: {
          Dashboard: ['view'],
          Orders: ['view', 'create', 'edit', 'export'],
          Quotations: ['view', 'create', 'edit'],
          Invoices: ['view', 'export'],
        },
      },
      planner: {
        system_access: ['Dashboard', 'Orders', 'Production', 'Dispatch'],
        partial_access: {
          Dashboard: ['view'],
          Orders: ['view', 'edit'],
          Production: ['view', 'edit', 'assign'],
          Dispatch: ['view', 'edit'],
        },
      },
      accounts: {
        system_access: ['Dashboard', 'Invoices', 'Reports'],
        partial_access: {
          Dashboard: ['view'],
          Invoices: ['view', 'create', 'edit', 'export'],
          Reports: ['view', 'export'],
        },
      },
      inventory: {
        system_access: ['Dashboard', 'Inventory', 'Orders'],
        partial_access: {
          Dashboard: ['view'],
          Inventory: ['view', 'edit'],
          Orders: ['view'],
        },
      },
    };

    return permissionMap[role] || permissionMap.sales;
  }
}
