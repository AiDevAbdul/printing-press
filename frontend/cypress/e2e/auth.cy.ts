describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login page', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button').contains(/login|sign in/i).should('be.visible');
  });

  it('should show error on invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@test.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button').contains(/login|sign in/i).click();

    cy.get('[role="alert"]').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.get('input[type="email"]').type('admin@printingpress.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button').contains(/login|sign in/i).click();

    cy.url().should('include', '/dashboard');
    cy.get('h1, h2').should('be.visible');
  });

  it('should persist session after login', () => {
    cy.get('input[type="email"]').type('admin@printingpress.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button').contains(/login|sign in/i).click();

    cy.url().should('include', '/dashboard');
    cy.reload();
    cy.url().should('include', '/dashboard');
  });

  it('should logout successfully', () => {
    cy.get('input[type="email"]').type('admin@printingpress.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button').contains(/login|sign in/i).click();

    cy.url().should('include', '/dashboard');

    // Find and click logout button
    cy.get('button').contains(/logout|sign out/i).click();
    cy.url().should('include', '/login');
  });
});
