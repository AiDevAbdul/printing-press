import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

// Mock API responses
export const mockApiResponses = {
  orders: {
    list: {
      data: [
        {
          id: '1',
          order_number: 'ORD-001',
          customer_id: '1',
          customer: { name: 'Customer 1', company_name: 'Company 1' },
          order_date: '2026-04-07',
          delivery_date: '2026-04-14',
          status: 'pending',
          priority: 'high',
          product_name: 'Test Product',
          quantity: 100,
          unit: 'pieces',
          final_price: 5000,
        },
      ],
    },
    create: {
      data: {
        id: '1',
        order_number: 'ORD-001',
        status: 'created',
      },
    },
    update: {
      data: {
        id: '1',
        status: 'updated',
      },
    },
    delete: {
      data: { success: true },
    },
  },
  designs: {
    list: {
      data: [
        {
          id: '1',
          name: 'Design 1',
          type: 'box',
          category: 'commercial',
          status: 'in_design',
          designer_name: 'John Doe',
        },
      ],
    },
    create: {
      data: {
        id: '1',
        name: 'Design 1',
        status: 'created',
      },
    },
  },
  specifications: {
    list: {
      data: [
        {
          id: '1',
          customer_group: 'Group A',
          form_number: 'CPP001',
          card_type: 'art_card',
          gramage: 300,
          status: 'pending',
        },
      ],
    },
    create: {
      data: {
        id: '1',
        customer_group: 'Group A',
        status: 'created',
      },
    },
  },
  users: {
    list: {
      data: [
        {
          id: '1',
          email: 'user@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'sales',
        },
      ],
    },
    create: {
      data: {
        id: '1',
        email: 'newuser@example.com',
        status: 'created',
      },
    },
  },
};

// Mock localStorage
export const mockLocalStorage = {
  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
  },
  setRefreshToken: (token: string) => {
    localStorage.setItem('refresh_token', token);
  },
  setCompany: (company: { id: string; name: string }) => {
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  },
  clear: () => {
    localStorage.clear();
  },
};

// Mock API client
export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
};

// Helper to setup API mocks
export function setupApiMocks() {
  mockApiClient.get.mockResolvedValue(mockApiResponses.orders.list);
  mockApiClient.post.mockResolvedValue(mockApiResponses.orders.create);
  mockApiClient.put.mockResolvedValue(mockApiResponses.orders.update);
  mockApiClient.delete.mockResolvedValue(mockApiResponses.orders.delete);
}

// Helper to setup error mocks
export function setupApiErrorMocks(status: number, message: string) {
  const error = new Error(message);
  (error as any).response = { status, data: { message } };

  mockApiClient.get.mockRejectedValue(error);
  mockApiClient.post.mockRejectedValue(error);
  mockApiClient.put.mockRejectedValue(error);
  mockApiClient.delete.mockRejectedValue(error);
}

// Helper to wait for async operations
export async function waitForAsync() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Helper to create mock user
export function createMockUser(overrides = {}) {
  return {
    id: '1',
    email: 'user@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'sales',
    company_id: 'company-1',
    ...overrides,
  };
}

// Helper to create mock order
export function createMockOrder(overrides = {}) {
  return {
    id: '1',
    order_number: 'ORD-001',
    customer_id: '1',
    customer: { name: 'Customer 1', company_name: 'Company 1' },
    order_date: '2026-04-07',
    delivery_date: '2026-04-14',
    status: 'pending',
    priority: 'high',
    product_name: 'Test Product',
    quantity: 100,
    unit: 'pieces',
    final_price: 5000,
    ...overrides,
  };
}

// Helper to create mock design
export function createMockDesign(overrides = {}) {
  return {
    id: '1',
    name: 'Design 1',
    type: 'box',
    category: 'commercial',
    status: 'in_design',
    designer_name: 'John Doe',
    description: 'Test design',
    company_id: 'company-1',
    ...overrides,
  };
}

// Helper to create mock specification
export function createMockSpecification(overrides = {}) {
  return {
    id: '1',
    customer_group: 'Group A',
    form_number: 'CPP001',
    card_type: 'art_card',
    gramage: 300,
    back_printing: false,
    status: 'pending',
    company_id: 'company-1',
    ...overrides,
  };
}

// Helper to verify form submission
export async function verifyFormSubmission(
  submitButton: HTMLElement,
  expectedApiCall: string,
  mockApi: any
) {
  submitButton.click();
  await waitForAsync();

  expect(mockApi).toHaveBeenCalledWith(
    expect.stringContaining(expectedApiCall),
    expect.any(Object)
  );
}

// Helper to fill form field
export async function fillFormField(
  user: any,
  labelText: string | RegExp,
  value: string | number
) {
  const input = document.querySelector(`[aria-label*="${labelText}"]`) ||
    document.querySelector(`label:has-text("${labelText}") ~ input`);

  if (input) {
    await user.type(input, String(value));
  }
}

// Helper to select dropdown option
export async function selectDropdownOption(
  user: any,
  labelText: string | RegExp,
  optionText: string | RegExp
) {
  const select = document.querySelector(`[aria-label*="${labelText}"]`);

  if (select) {
    await user.click(select);
    const option = document.querySelector(`[role="option"]:has-text("${optionText}")`);
    if (option) {
      await user.click(option);
    }
  }
}

// Helper to check for validation errors
export function getValidationErrors() {
  const errorElements = document.querySelectorAll('[role="alert"]');
  return Array.from(errorElements).map(el => el.textContent);
}

// Helper to check if button is disabled
export function isButtonDisabled(buttonText: string | RegExp) {
  const button = document.querySelector(`button:has-text("${buttonText}")`);
  return button?.hasAttribute('disabled');
}

// Helper to mock toast notifications
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
};

// Helper to setup localStorage with auth
export function setupAuthLocalStorage(token = 'test-token', company = { id: 'company-1', name: 'Test Company' }) {
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', 'test-refresh-token');
  localStorage.setItem('selectedCompany', JSON.stringify(company));
}

// Helper to clear all mocks
export function clearAllMocks() {
  vi.clearAllMocks();
  localStorage.clear();
  mockApiClient.get.mockReset();
  mockApiClient.post.mockReset();
  mockApiClient.put.mockReset();
  mockApiClient.delete.mockReset();
}
