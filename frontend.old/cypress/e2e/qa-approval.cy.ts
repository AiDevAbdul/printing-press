describe('QA Approval Workflow', () => {
  beforeEach(() => {
    // Login as QA Manager
    cy.visit('/');
    cy.get('input[type="email"]').type('admin@printingpress.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button').contains(/login|sign in/i).click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to QA approval page', () => {
    cy.get('a, button').contains(/qa|approval|quality/i).click();
    cy.url().should('include', '/qa-approval');
    cy.get('h1, h2').should('be.visible');
  });

  it('should display approval statistics', () => {
    cy.get('a, button').contains(/qa|approval|quality/i).click();
    cy.url().should('include', '/qa-approval');

    // Check for stat cards
    cy.get('[class*="stat"], [class*="card"]').should('have.length.greaterThan', 0);
  });

  it('should display pending approvals', () => {
    cy.get('a, button').contains(/qa|approval|quality/i).click();
    cy.url().should('include', '/qa-approval');

    // Look for approval queue or pending items
    cy.get('body').should('contain', /pending|approval|queue/i);
  });

  it('should have approval action buttons', () => {
    cy.get('a, button').contains(/qa|approval|quality/i).click();
    cy.url().should('include', '/qa-approval');

    // Check for approve/reject buttons
    cy.get('button').contains(/approve|reject/i).should('exist');
  });

  it('should display approval history tab', () => {
    cy.get('a, button').contains(/qa|approval|quality/i).click();
    cy.url().should('include', '/qa-approval');

    // Look for history tab
    cy.get('[role="tab"], button').contains(/history|completed/i).should('exist');
  });

  it('should filter approvals by status', () => {
    cy.get('a, button').contains(/qa|approval|quality/i).click();
    cy.url().should('include', '/qa-approval');

    // Look for filter options
    cy.get('select, [role="combobox"], button').contains(/filter|status/i).should('exist');
  });

  it('should search approvals', () => {
    cy.get('a, button').contains(/qa|approval|quality/i).click();
    cy.url().should('include', '/qa-approval');

    // Look for search input
    cy.get('input[type="search"], input[placeholder*="search" i]').should('exist');
  });

  it('should display approval details', () => {
    cy.get('a, button').contains(/qa|approval|quality/i).click();
    cy.url().should('include', '/qa-approval');

    // Click on an approval item
    cy.get('[class*="card"], [class*="item"]').first().click({ force: true });

    // Check for details display
    cy.get('[role="dialog"], [class*="modal"], [class*="details"]').should('exist');
  });
});
