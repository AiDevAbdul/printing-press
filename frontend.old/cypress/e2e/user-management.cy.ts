describe('User Management', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/');
    cy.get('input[type="email"]').type('admin@printingpress.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button').contains(/login|sign in/i).click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to user management page', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');
    cy.get('h1, h2').should('be.visible');
  });

  it('should display user list', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');

    // Check for table or list
    cy.get('table, [role="grid"], [class*="list"]').should('be.visible');
  });

  it('should have add user button', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');

    cy.get('button').contains(/add|create|new/i).should('be.visible');
  });

  it('should search users', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');

    // Look for search input
    cy.get('input[type="search"], input[placeholder*="search" i]').should('exist');
  });

  it('should filter users by role', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');

    // Look for role filter
    cy.get('select, [role="combobox"]').contains(/role|filter/i).should('exist');
  });

  it('should display user actions', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');

    // Check for edit/delete buttons
    cy.get('button').contains(/edit|delete|remove/i).should('exist');
  });

  it('should open add user modal', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');

    cy.get('button').contains(/add|create|new/i).click();

    // Check for modal
    cy.get('[role="dialog"], [class*="modal"]').should('be.visible');
  });

  it('should display user details', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');

    // Click on a user row
    cy.get('table tbody tr, [class*="row"]').first().click({ force: true });

    // Check for details display
    cy.get('[role="dialog"], [class*="modal"], [class*="details"]').should('exist');
  });

  it('should have pagination', () => {
    cy.get('a, button').contains(/user|management|admin/i).click();
    cy.url().should('include', '/user-management');

    // Look for pagination controls
    cy.get('[class*="pagination"], button').contains(/next|previous|page/i).should('exist');
  });
});
