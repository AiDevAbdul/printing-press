# Form Testing - Quick Reference Guide

## Test Files Summary

| File | Location | Tests | Coverage |
|------|----------|-------|----------|
| OrderFormModal.spec.tsx | pages/orders/ | 10 | Order creation, validation, API |
| DesignFormModal.spec.tsx | pages/prepress/ | 13 | Design management, approvals |
| SpecificationFormModal.spec.tsx | pages/prepress/ | 14 | Specifications, multi-step forms |
| DeliveryForm.spec.tsx | pages/dispatch/ | 8 | Delivery tracking, validation |
| QualityForms.spec.tsx | pages/quality/ | 21 | Defects, inspections, rejections |
| UserManagementForms.spec.tsx | pages/users/ | 24 | User CRUD, roles, substitution |
| api.spec.ts | services/ | 20 | API integration, interceptors |
| e2e-workflows.spec.ts | test/ | 30+ | Complete workflows, error handling |
| test-utils.ts | test/ | Utilities | Mock data, helpers, setup |

**Total Test Cases: 140+**

## Running Tests

### Quick Commands
```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test:run -- OrderFormModal.spec.tsx

# Run tests matching pattern
npm run test:run -- --grep "should fill"

# Run with verbose output
npm run test:run -- --reporter=verbose
```

## Test Coverage by Feature

### Order Management ✅
- [x] Create order with all fields
- [x] Validate required fields
- [x] Handle API errors
- [x] Submit form successfully
- [x] Close modal
- [x] Edit existing order
- [x] Multi-step form navigation

### Design Management ✅
- [x] Create design
- [x] Select design type
- [x] Assign designer
- [x] Track status changes
- [x] Handle approvals
- [x] Manage attachments
- [x] Edit design

### Specifications ✅
- [x] Create specification
- [x] Fill all spec fields (60+)
- [x] Select card type
- [x] Input CMYK colors
- [x] Input Pantone colors
- [x] Toggle options (lamination, varnish)
- [x] Multi-step form
- [x] Approval workflow

### Delivery ✅
- [x] Create delivery
- [x] Fill address
- [x] Select status
- [x] Add special instructions
- [x] Validate fields
- [x] Submit form

### Quality Control ✅
- [x] Create defect report
- [x] Create inspection
- [x] Create rejection
- [x] Track resolution
- [x] Validate severity
- [x] Handle reprint workflow

### User Management ✅
- [x] Add user
- [x] Edit user
- [x] Change role
- [x] Substitute user
- [x] Validate email
- [x] Validate password
- [x] Handle permissions

### API Integration ✅
- [x] Add auth token
- [x] Add company_id header
- [x] Handle 401 errors
- [x] Refresh token
- [x] GET requests
- [x] POST requests
- [x] PUT requests
- [x] DELETE requests
- [x] Error handling
- [x] Network errors

## API Endpoints Tested

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Designs
- `POST /api/prepress/designs` - Create design
- `GET /api/prepress/designs` - List designs
- `PUT /api/prepress/designs/:id` - Update design
- `DELETE /api/prepress/designs/:id` - Delete design
- `POST /api/prepress/approvals` - Create approval
- `POST /api/prepress/attachments` - Add attachment

### Specifications
- `POST /api/prepress/specifications` - Create spec
- `GET /api/prepress/specifications` - List specs
- `PUT /api/prepress/specifications/:id` - Update spec
- `POST /api/prepress/specifications/:id/approve` - Approve spec

### Users
- `POST /api/users` - Create user
- `GET /api/users` - List users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/substitute` - Substitute user

### Quality
- `POST /api/quality/defects` - Create defect
- `POST /api/quality/inspections` - Create inspection
- `POST /api/quality/rejections` - Create rejection

### Delivery
- `POST /api/dispatch/deliveries` - Create delivery
- `PUT /api/dispatch/deliveries/:id` - Update delivery

## Form Validation Tests

### Required Fields
- [x] Email validation
- [x] Password strength
- [x] Password confirmation
- [x] Date format
- [x] Number ranges
- [x] Text length
- [x] Dropdown selection

### Error Messages
- [x] Required field errors
- [x] Format validation errors
- [x] API error messages
- [x] Network error messages
- [x] Timeout messages

## Multi-Company Testing

- [x] Company isolation
- [x] Company switching
- [x] Company_id in headers
- [x] Company_id in requests
- [x] Data filtering by company
- [x] User company assignment

## Authentication Testing

- [x] Token in headers
- [x] Token refresh on 401
- [x] Token expiration
- [x] Logout on failed refresh
- [x] localStorage management

## Error Scenarios Tested

| Error Type | Status | Test |
|-----------|--------|------|
| Validation Error | 400 | ✅ |
| Unauthorized | 401 | ✅ |
| Forbidden | 403 | ✅ |
| Not Found | 404 | ✅ |
| Server Error | 500 | ✅ |
| Network Error | N/A | ✅ |
| Timeout | N/A | ✅ |

## Test Utilities Available

```typescript
// Render with providers
renderWithProviders(component)

// Mock data
createMockUser()
createMockOrder()
createMockDesign()
createMockSpecification()

// API mocks
setupApiMocks()
setupApiErrorMocks(status, message)
mockApiClient.get/post/put/delete

// Helpers
fillFormField(user, label, value)
selectDropdownOption(user, label, option)
getValidationErrors()
isButtonDisabled(text)
setupAuthLocalStorage()
clearAllMocks()
```

## Common Test Patterns

### Test Form Submission
```typescript
it('should submit form', async () => {
  const user = userEvent.setup();
  renderWithProviders(<Form />);

  await user.type(screen.getByLabelText(/field/i), 'value');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalled();
  });
});
```

### Test Validation
```typescript
it('should show validation error', async () => {
  const user = userEvent.setup();
  renderWithProviders(<Form />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

### Test API Error
```typescript
it('should handle API error', async () => {
  (api.post as any).mockRejectedValueOnce(new Error('API Error'));

  renderWithProviders(<Form />);
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Debugging Tips

### View DOM
```typescript
screen.debug()
```

### Find Elements
```typescript
screen.logTestingPlaygroundURL()
```

### Check Mocks
```typescript
console.log(api.post.mock.calls)
```

### Increase Timeout
```typescript
vi.setConfig({ testTimeout: 10000 })
```

## Coverage Report

Run coverage:
```bash
npm run test:coverage
```

View HTML report:
```bash
open coverage/index.html
```

## CI/CD Integration

Tests run on:
- Pull requests
- Commits to main
- Pre-commit hooks

Ensure tests pass:
```bash
npm run test:run
```

## Troubleshooting

### Tests Timeout
- Check for unresolved promises
- Use `waitFor` for async operations
- Increase timeout if needed

### Mock Not Working
- Verify mock path matches import
- Clear mocks between tests
- Check mock is defined before import

### Element Not Found
- Use `screen.debug()` to see DOM
- Check for async rendering
- Use correct query method

### API Not Called
- Verify mock is set up
- Check request body
- Ensure form submission triggered

## Next Steps

1. ✅ Run all tests: `npm run test:run`
2. ✅ Check coverage: `npm run test:coverage`
3. ✅ Fix any failures
4. ✅ Add tests for new forms
5. ✅ Monitor performance
6. ✅ Update tests when requirements change

## Test Maintenance

### When to Update Tests
- Form fields change
- API endpoints change
- Validation rules change
- Error messages change
- New features added

### Best Practices
- Keep tests focused
- Use semantic queries
- Test user behavior
- Mock external dependencies
- Clean up after tests
- Use descriptive names
- Test error cases
- Avoid test interdependence

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [API Testing Guide](https://docs.anthropic.com/)

## Support

For issues or questions:
1. Check test output: `npm run test:ui`
2. Review test file comments
3. Check FORM_TESTING_GUIDE.md
4. Review test-utils.ts helpers
5. Check existing test patterns
