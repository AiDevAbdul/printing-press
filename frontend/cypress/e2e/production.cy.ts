describe('Production Workflow', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/');
    cy.get('input[type="email"]').type('admin@printingpress.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button').contains(/login|sign in/i).click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to production page', () => {
    cy.get('a, button').contains(/production|workflow/i).click();
    cy.url().should('include', '/production');
    cy.get('h1, h2').contains(/production|workflow/i).should('be.visible');
  });

  it('should display workflow stages', () => {
    cy.get('a, button').contains(/production|workflow/i).click();
    cy.url().should('include', '/production');

    // Check for stage elements
    cy.get('[class*="stage"], [class*="card"]').should('have.length.greaterThan', 0);
  });

  it('should display stage details', () => {
    cy.get('a, button').contains(/production|workflow/i).click();
    cy.url().should('include', '/production');

    // Click on first stage
    cy.get('[class*="stage"], [class*="card"]').first().click();

    // Check for stage details modal or panel
    cy.get('[role="dialog"], [class*="modal"], [class*="panel"]').should('be.visible');
  });

  it('should handle stage actions', () => {
    cy.get('a, button').contains(/production|workflow/i).click();
    cy.url().should('include', '/production');

    // Click on a stage
    cy.get('[class*="stage"], [class*="card"]').first().click();

    // Look for action buttons
    cy.get('button').should('have.length.greaterThan', 0);
  });

  it('should show progress indicator', () => {
    cy.get('a, button').contains(/production|workflow/i).click();
    cy.url().should('include', '/production');

    // Check for progress bar or percentage
    cy.get('[class*="progress"], [class*="percent"]').should('exist');
  });

  it('should display operator and machine info', () => {
    cy.get('a, button').contains(/production|workflow/i).click();
    cy.url().should('include', '/production');

    // Check for operator/machine information
    cy.get('body').should('contain', /operator|machine|printer/i);
  });
});
