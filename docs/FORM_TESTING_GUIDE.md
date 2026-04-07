# Form Testing Guide

## Overview

This document provides comprehensive guidance on testing all forms in the Printing Press Management System. The test suite covers API integration, button functionality, form validation, and backend connectivity.

## Test Files Created

### 1. Order Form Tests
**File**: `frontend/src/pages/orders/OrderFormModal.spec.tsx`

**Coverage**:
- Modal rendering and visibility
- Form field population (customer, date, product, quantity)
- Form submission
- Validation of required fields
- Error handling
- API integration
- Close button functionality

**Key Tests**:
```bash
✓ should render modal when isOpen is true
✓ should fill customer field and submit form
✓ should display error message when error prop is true
✓ should disable submit button when isSubmitting is true
✓ should validate required fields
✓ should handle API errors gracefully
```

### 2. Design Form Tests
**File**: `frontend/src/pages/prepress/DesignFormModal.spec.tsx`

**Coverage**:
- Design form rendering
- Design type selection
- Product category selection
- Status selection
- Designer assignment
- Description input
- Form submission
- Edit mode with pre-populated data

**Key Tests**:
```bash
✓ should render design form modal when isOpen is true
✓ should select design type
✓ should select product category
✓ should select design status
✓ should fill designer name field
✓ should handle form submission
✓ should populate form with existing design data when editing
```

### 3. Specification Form Tests
**File**: `frontend/src/pages/prepress/SpecificationFormModal.spec.tsx`

**Coverage**:
- Specification form rendering
- Customer group input
- Form number input
- Card type selection
- Gramage input
- Back printing toggle
- Lamination type selection
- CMYK color values
- Pantone color fields
- Card sizing
- Batch number
- Multi-step form navigation

**Key Tests**:
```bash
✓ should fill customer group field
✓ should select card type
✓ should fill gramage field
✓ should toggle back printing checkbox
✓ should fill CMYK color values
✓ should fill Pantone color fields
✓ should handle multi-step form navigation
```

### 4. Delivery Form Tests
**File**: `frontend/src/pages/dispatch/DeliveryForm.spec.tsx`

**Coverage**:
- Delivery form rendering
- Delivery date input
- Address input
- Recipient name
- Phone number
- Status selection
- Special instructions
- Form submission
- Validation

**Key Tests**:
```bash
✓ should fill delivery date field
✓ should fill delivery address field
✓ should fill recipient name field
✓ should select delivery status
✓ should submit delivery form
✓ should validate required fields
```

### 5. Quality Forms Tests
**File**: `frontend/src/pages/quality/QualityForms.spec.tsx`

**Coverage**:
- Defect form (description, severity, type, quantity)
- Inspection form (date, status, notes, inspector)
- Rejection form (reason, category, quantity, notes)
- Form submission for all three forms
- Validation for all forms
- API error handling

**Key Tests**:
```bash
✓ DefectForm: should fill defect description
✓ DefectForm: should select defect severity
✓ InspectionForm: should fill inspection date
✓ InspectionForm: should select inspection status
✓ RejectionForm: should fill rejection reason
✓ RejectionForm: should submit rejection form
```

### 6. User Management Forms Tests
**File**: `frontend/src/pages/users/UserManagementForms.spec.tsx`

**Coverage**:
- Add User Modal (email, name, role, password)
- Edit User Modal (update user data)
- Substitute User Modal (user replacement)
- Email validation
- Password matching
- Role selection
- Date range for substitution
- API integration

**Key Tests**:
```bash
✓ AddUserModal: should fill email field
✓ AddUserModal: should select user role
✓ AddUserModal: should validate email format
✓ AddUserModal: should validate password match
✓ EditUserModal: should populate form with user data
✓ SubstituteUserModal: should select original user
✓ SubstituteUserModal: should validate that different users are selected
```

### 7. API Service Tests
**File**: `frontend/src/services/api.spec.ts`

**Coverage**:
- Request interceptor (token, company_id)
- Response interceptor (401 handling, token refresh)
- GET/POST/PUT/DELETE endpoints
- Multi-company support
- Error handling (validation, server, timeout, network)
- Request/response logging

**Key Tests**:
```bash
✓ should add authorization header with token
✓ should add company_id header from localStorage
✓ should handle 401 unauthorized response
✓ should make GET request to orders endpoint
✓ should make POST request to create order
✓ should include company_id in request headers
✓ should handle validation errors
✓ should handle server errors
```

## Test Utilities

**File**: `frontend/src/test/test-utils.ts`

Provides helper functions for testing:

### Render Functions
```typescript
renderWithProviders(ui, options)  // Render with QueryClient provider
```

### Mock Data Generators
```typescript
createMockUser(overrides)
createMockOrder(overrides)
createMockDesign(overrides)
createMockSpecification(overrides)
```

### API Mocks
```typescript
setupApiMocks()              // Setup successful API responses
setupApiErrorMocks(status, message)  // Setup error responses
mockApiClient.get/post/put/delete
```

### Helper Functions
```typescript
fillFormField(user, labelText, value)
selectDropdownOption(user, labelText, optionText)
getValidationErrors()
isButtonDisabled(buttonText)
setupAuthLocalStorage(token, company)
clearAllMocks()
```

## Running Tests

### Run All Tests
```bash
npm run test:run
```

### Run Tests in Watch Mode
```bash
npm run test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm run test:run -- OrderFormModal.spec.tsx
```

### Run Tests Matching Pattern
```bash
npm run test:run -- --grep "should fill"
```

## Test Structure

Each test file follows this structure:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock external dependencies
vi.mock('../../services/api');
vi.mock('react-hot-toast');

// Setup
const queryClient = new QueryClient({...});
const renderWithProviders = (component) => {...};

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should test specific behavior', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Component />);

    // Interact with component
    await user.click(screen.getByRole('button'));

    // Assert
    expect(screen.getByText(/expected/i)).toBeInTheDocument();
  });
});
```

## API Testing Checklist

### For Each Form:
- [ ] Form renders correctly
- [ ] All input fields accept values
- [ ] Validation errors display for required fields
- [ ] Submit button is disabled during submission
- [ ] API POST/PUT request is made on submit
- [ ] Success response is handled
- [ ] Error response is handled
- [ ] Close/Cancel button works
- [ ] Modal closes after successful submission
- [ ] Toast notifications appear

### API Integration Points:
- [ ] Authorization header includes token
- [ ] X-Company-ID header is included
- [ ] Request body is formatted correctly
- [ ] Response data is processed correctly
- [ ] Error messages are user-friendly
- [ ] Network errors are handled
- [ ] Timeout errors are handled
- [ ] 401 errors trigger token refresh

## Common Test Patterns

### Testing Form Submission
```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const mockOnSubmit = vi.fn();

  renderWithProviders(<Form onSubmit={mockOnSubmit} />);

  await user.type(screen.getByLabelText(/field/i), 'value');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      field: 'value'
    }));
  });
});
```

### Testing API Calls
```typescript
it('should call API on form submit', async () => {
  const user = userEvent.setup();
  (api.post as any).mockResolvedValueOnce({ data: { id: '1' } });

  renderWithProviders(<Form />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/endpoint', expect.any(Object));
  });
});
```

### Testing Validation
```typescript
it('should show validation error for required field', async () => {
  const user = userEvent.setup();

  renderWithProviders(<Form />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

### Testing Error Handling
```typescript
it('should handle API error', async () => {
  const user = userEvent.setup();
  (api.post as any).mockRejectedValueOnce(new Error('API Error'));

  renderWithProviders(<Form />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Debugging Tests

### View Test Output
```bash
npm run test:ui
```

### Debug Specific Test
```bash
npm run test:run -- --inspect-brk OrderFormModal.spec.tsx
```

### Print DOM
```typescript
import { screen } from '@testing-library/react';

it('should debug', () => {
  renderWithProviders(<Component />);
  screen.debug(); // Prints entire DOM
});
```

### Check Element Queries
```typescript
it('should find element', () => {
  renderWithProviders(<Component />);

  // These help debug element selection
  screen.logTestingPlaygroundURL();
  screen.getByRole('button', { name: /submit/i });
});
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report:
```bash
npm run test:coverage
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-commit hooks

Ensure all tests pass before merging:
```bash
npm run test:run
```

## Troubleshooting

### Tests Timeout
- Increase timeout: `vi.setConfig({ testTimeout: 10000 })`
- Check for unresolved promises
- Verify async/await usage

### Mock Not Working
- Ensure mock is defined before import
- Check mock path matches actual import
- Use `vi.clearAllMocks()` between tests

### Element Not Found
- Use `screen.debug()` to see DOM
- Check for async rendering with `waitFor`
- Verify correct query method (getBy, queryBy, findBy)

### API Not Called
- Verify mock is set up correctly
- Check request body matches expectations
- Ensure form submission is triggered

## Best Practices

1. **Use semantic queries**: `getByRole`, `getByLabelText` over `getByTestId`
2. **Test user behavior**: Click buttons, type in fields, not implementation details
3. **Use `waitFor` for async**: Don't use `setTimeout`
4. **Mock external dependencies**: API calls, localStorage, toast notifications
5. **Keep tests focused**: One behavior per test
6. **Use descriptive names**: Test name should explain what is being tested
7. **Clean up after tests**: Use `afterEach` to clear mocks and state
8. **Test error cases**: Not just happy path
9. **Test accessibility**: Use accessible queries and roles
10. **Avoid test interdependence**: Each test should be independent

## Next Steps

1. Run all tests: `npm run test:run`
2. Check coverage: `npm run test:coverage`
3. Fix any failing tests
4. Add tests for new forms as they're created
5. Monitor test performance
6. Update tests when requirements change
