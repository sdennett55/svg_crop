describe('SVG Crop app', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500');
  });

  it('uploads by FILE INPUT and the download and copy to clipboard buttons appear', () => {
    cy.fixture('logo.svg').then(fileContent => {
        cy.get('input[type="file"]').attachFile({
            fileContent: fileContent.toString(),
            fileName: 'logo.svg',
        });
    });

    cy.get('a[download]')
      .invoke('text')
      .should('equal', 'Download');
    
    cy.get('.CopyButton')
      .invoke('text')
      .should('equal', 'Copy to clipboard');
  });

  // it('uploads by FILE DROP and the download and copy to clipboard buttons appear', () => {
  //   cy.get('#drop_zone')
  //     .attachFile('logo.svg', { subjectType: 'drag-n-drop' }).debug();

  //   cy.get('a[download]')
  //     .invoke('text')
  //     .should('equal', 'Download');
    
  //   cy.get('.CopyButton')
  //     .invoke('text')
  //     .should('equal', 'Copy to clipboard');
  // })
});