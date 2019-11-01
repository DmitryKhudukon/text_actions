describe('Test replacements', () => {
  it('Successfully loaded page', () => {
    cy.visit('/');
  });

  it('Successfully enter find value: (i|n|p|u|t)', () => {
    cy.get('[data-cy=find-input-0]').type('(i|n|p|u|t)')
  });

  it('Successfully enter replace value: z', () => {
    cy.get('[data-cy=replace-input-0]').type('z');
  });

  it('Successfully check result', () => {
    cy.get('[data-cy="result-textfield"]')
      .invoke('val')
      .then(val => {
        expect(val).to.equal('zzzzz')
      });
  });

  it('Successfully enter input value: All inclusive', () => {
    cy.get('[data-cy=source-textfield]').type('{selectAll}All inclusive')
  });
  it('Successfully check result', () => {
    cy.get('[data-cy="result-textfield"]')
      .invoke('val')
      .then(val => {
        expect(val).to.equal('All zzclzszve')
      });
  });
});

// Test this:
// cy.get('[data-cy=find-input-1]').invoke('val', '(i|n|p|u|t)').trigger('change');
