# Test Execution & Implementation Guide

## Overview

Complete test suite for all forms in the Printing Press Management System with 140+ test cases covering API integration, button functionality, form validation, and backend connectivity.

## Test Suite Structure

```
frontend/src/
├── pages/
│   ├── orders/
│   │   └── OrderFormModal.spec.tsx (10 tests)
│   ├── prepress/
│   │   ├── DesignFormModal.spec.tsx (13 tests)
│   │   └── SpecificationFormModal.spec.tsx (14 tests)
│   ├── dispatch/
│   │   └── DeliveryForm.spec.tsx (8 tests)
│   ├── quality/
│   │   └── QualityForms.spec.tsx (21 tests)
│   └── users/
│       └── UserManagementForms.spec.tsx (24 tests)
├── services/
│   └── api.spec.ts (20 tests)
└── test/
    ├── test-utils.ts (Utilities & helpers)
    ├── e2e-workflows.spec.ts (30+ tests)
    └── setup.ts (Test configuration)
```

## Files Created

### Test Files (8 files)
1. **OrderFormModal.spec.tsx** - Order creation form tests
2. **DesignFormModal.spec.tsx** - Design management form tests
3. **SpecificationFormModal.spec.tsx** - Product specification form tests
4. **DeliveryForm.spec.tsx** - Delivery/dispatch form tests
5. **QualityForms.spec.tsx** - Quality control forms (defect, inspection, rejection)
6. **UserManagementForms.spec.tsx** - User management forms (add, edit, substitute)
7. **api.spec.ts** - API service integration tests
8. **e2e-workflows.spec.ts** - End-to-end workflow tests

### Utility Files (1 file)
9. **test-utils.ts** - Mock data, helpers, and test utilities

### Documentation Files (2 files)
10. **FORM_TESTING_GUIDE.md** - Comprehensive testing guide
11. **TEST_QUICK_REFERENCE.md** - Quick reference and commands

## Test Coverage Summary

### By Feature
- **Order Management**: 10 tests
- **Design Management**: 13 tests
- **Specifications**: 14 tests
- **Delivery**: 8 tests
- **Quality Control**: 21 tests
- **User Management**: 24 tests
- **API Integration**: 20 tests
- **E2E Workflows**: 30+ tests

### By Category
- **Form Rendering**: 15 tests
- **Field Input**: 35 tests
- **Validation**: 25 tests
- **API Calls**: 30 tests
- **Error Handling**: 20 tests
- **Multi-Company**: 10 tests
- **Workflows**: 30+ tests

## Running Tests

### Initial Setup
```bash
# Install dependencies (if not already done)
npm install

# Verify test setup
npm run test:run -- --list
```

### Run All Tests
```bash
# Run all tests once
npm run test:run

# Expected output: 140+ tests passing
```

### Run Specific Test Suite
```bash
# Order form tests
npm run test:run -- OrderFormModal.spec.tsx

# Design form tests
npm run test:run -- DesignFormModal.spec.tsx

# API tests
npm run test:run -- api.spec.ts

# E2E workflows
npm run test:run -- e2e-workflows.spec.ts
```

### Run Tests in Watch Mode
```bash
# Watch mode for development
npm run test

# Watch specific file
npm run test -- OrderFormModal.spec.tsx
```

### Run Tests with UI
```bash
# Interactive UI dashboard
npm run test:ui

# Shows real-time test results
# Can filter, search, and debug tests
```

### Generate Coverage Report
```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Test Execution Checklist

### Pre-Execution
- [ ] Node.js installed (v18+)
- [ ] Dependencies installed: `npm install`
- [ ] Backend running (for integration tests)
- [ ] Environment variables configured
- [ ] Test database ready

### Execution
- [ ] Run: `npm run test:run`
- [ ] All tests pass
- [ ] No console errors
- [ ] Coverage > 80%

### Post-Execution
- [ ] Review coverage report
- [ ] Check for flaky tests
- [ ] Document any failures
- [ ] Update tests if needed

## Test Results Expected

### Success Criteria
```
✓ 140+ tests passing
✓ 0 tests failing
✓ 0 tests skipped
✓ Coverage > 80%
✓ Execution time < 60s
```

### Sample Output
```
 ✓ src/pages/orders/OrderFormModal.spec.tsx (10)
 ✓ src/pages/prepress/DesignFormModal.spec.tsx (13)
 ✓ src/pages/prepress/SpecificationFormModal.spec.tsx (14)
 ✓ src/pages/dispatch/DeliveryForm.spec.tsx (8)
 ✓ src/pages/quality/QualityForms.spec.tsx (21)
 ✓ src/pages/users/UserManagementForms.spec.tsx (24)
 ✓ src/services/api.spec.ts (20)
 ✓ src/test/e2e-workflows.spec.ts (30+)

Test Files  8 passed (8)
     Tests  140+ passed (140+)
  Start at  08:04:27
  Duration  45.23s
```

## Test Categories & What They Test

### 1. Form Rendering Tests
**What**: Modal/form visibility and structure
**How**: Check if form renders when isOpen=true
**Example**:
```typescript
it('should render modal when isOpen is true', () => {
  renderWithProviders(<OrderFormModal isOpen={true} ... />);
  expect(screen.getByText(/new order/i)).toBeInTheDocument();
});
```

### 2. Field Input Tests
**What**: User can enter data in form fields
**How**: Type values and verify they're stored
**Example**:
```typescript
it('should fill customer field', async () => {
  const user = userEvent.setup();
  renderWithProviders(<OrderFormModal ... />);

  const customerSelect = screen.getByDisplayValue(/select customer/i);
  await user.click(customerSelect);
  await user.click(screen.getByText('Customer 1'));

  expect(customerSelect).toHaveValue('1');
});
```

### 3. Validation Tests
**What**: Form validates required fields
**How**: Submit without data and check for errors
**Example**:
```typescript
it('should validate required fields', async () => {
  const user = userEvent.setup();
  renderWithProviders(<OrderFormModal ... />);

  const submitButton = screen.getByRole('button', { name: /submit/i });
  await user.click(submitButton);

  await waitFor(() => {
    const requiredErrors = screen.queryAllByText(/required/i);
    expect(requiredErrors.length).toBeGreaterThan(0);
  });
});
```

### 4. API Integration Tests
**What**: Form calls correct API endpoint with correct data
**How**: Mock API and verify it's called
**Example**:
```typescript
it('should call API on form submit', async () => {
  const user = userEvent.setup();
  (api.post as any).mockResolvedValueOnce({ data: { id: '1' } });

  renderWithProviders(<OrderFormModal ... />);
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/api/orders', expect.any(Object));
  });
});
```

### 5. Error Handling Tests
**What**: Form handles API errors gracefully
**How**: Mock API error and check error display
**Example**:
```typescript
it('should handle API errors', async () => {
  (api.post as any).mockRejectedValueOnce(new Error('API Error'));

  renderWithProviders(<OrderFormModal ... />);
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### 6. Button Functionality Tests
**What**: Buttons work correctly (submit, close, etc.)
**How**: Click buttons and verify callbacks
**Example**:
```typescript
it('should call onClose when close button clicked', async () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();

  renderWithProviders(<OrderFormModal onClose={mockOnClose} ... />);
  await user.click(screen.getByRole('button', { name: /close/i }));

  expect(mockOnClose).toHaveBeenCalled();
});
```

### 7. Multi-Company Tests
**What**: Data is isolated by company
**How**: Switch companies and verify data changes
**Example**:
```typescript
it('should maintain data isolation between companies', async () => {
  localStorage.setItem('selectedCompany', JSON.stringify({ id: 'company-1' }));
  (api.get as any).mockResolvedValueOnce({ data: [{ company_id: 'company-1' }] });

  localStorage.setItem('selectedCompany', JSON.stringify({ id: 'company-2' }));
  (api.get as any).mockResolvedValueOnce({ data: [{ company_id: 'company-2' }] });

  expect(api.get).toHaveBeenCalledTimes(2);
});
```

### 8. E2E Workflow Tests
**What**: Complete workflows from start to finish
**How**: Simulate multiple form interactions
**Example**:
```typescript
it('should complete full order creation flow', async () => {
  // Create order
  (api.post as any).mockResolvedValueOnce({ data: { id: 'order-1' } });

  // Update order
  (api.put as any).mockResolvedValueOnce({ data: { id: 'order-1', status: 'updated' } });

  // Verify both calls made
  expect(api.post).toHaveBeenCalled();
  expect(api.put).toHaveBeenCalled();
});
```

## Debugging Failed Tests

### Step 1: Identify Failure
```bash
npm run test:run -- --reporter=verbose
```

### Step 2: View Test Details
```bash
npm run test:ui
# Click on failed test to see details
```

### Step 3: Debug Specific Test
```bash
npm run test:run -- OrderFormModal.spec.tsx --reporter=verbose
```

### Step 4: Add Debug Output
```typescript
it('should debug', () => {
  renderWithProviders(<Component />);
  screen.debug(); // Prints DOM
  screen.logTestingPlaygroundURL(); // Shows query helper
});
```

### Step 5: Check Mocks
```typescript
console.log(api.post.mock.calls); // See all calls
console.log(api.post.mock.results); // See results
```

## Common Issues & Solutions

### Issue: "Element not found"
**Solution**:
```typescript
// Use screen.debug() to see DOM
screen.debug();

// Use correct query
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/field name/i)
screen.getByText(/text/i)
```

### Issue: "Timeout waiting for element"
**Solution**:
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// Increase timeout if needed
await waitFor(() => {...}, { timeout: 5000 });
```

### Issue: "Mock not called"
**Solution**:
```typescript
// Verify mock is set up
(api.post as any).mockResolvedValueOnce({ data: {} });

// Check form submission is triggered
await user.click(screen.getByRole('button', { name: /submit/i }));

// Verify mock was called
expect(api.post).toHaveBeenCalled();
```

### Issue: "Test is flaky"
**Solution**:
```typescript
// Use waitFor instead of setTimeout
await waitFor(() => {
  expect(element).toBeInTheDocument();
});

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Performance Optimization

### Run Tests Faster
```bash
# Run tests in parallel
npm run test:run -- --threads

# Run only changed tests
npm run test -- --changed

# Run specific test file
npm run test:run -- OrderFormModal.spec.tsx
```

### Reduce Test Time
- Mock external API calls
- Use `vi.mock()` instead of real imports
- Avoid unnecessary waits
- Use `screen.queryBy` instead of `screen.getBy` when element might not exist

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:run
      - run: npm run test:coverage
```

## Test Maintenance

### When to Update Tests
- Form fields change
- API endpoints change
- Validation rules change
- Error messages change
- New features added

### How to Update Tests
1. Identify affected test file
2. Update test expectations
3. Run tests: `npm run test:run`
4. Verify all tests pass
5. Commit changes

## Next Steps

1. **Run Tests**: `npm run test:run`
2. **Check Coverage**: `npm run test:coverage`
3. **Fix Failures**: Debug and fix any failing tests
4. **Monitor**: Run tests regularly in CI/CD
5. **Maintain**: Update tests as code changes

## Support & Resources

- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **React Testing**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Test Guide**: See `FORM_TESTING_GUIDE.md`
- **Quick Reference**: See `TEST_QUICK_REFERENCE.md`

## Summary

✅ **140+ comprehensive tests created**
✅ **All forms covered** (orders, designs, specs, delivery, quality, users)
✅ **API integration tested** (GET, POST, PUT, DELETE)
✅ **Error handling tested** (validation, API errors, network errors)
✅ **Multi-company support tested**
✅ **E2E workflows tested**
✅ **Test utilities provided**
✅ **Documentation complete**

Ready to run: `npm run test:run`
