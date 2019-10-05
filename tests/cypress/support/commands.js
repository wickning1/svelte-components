/* global Cypress, cy */
Cypress.Commands.add('iframeLoaded',
  { prevSubject: 'element' },
  ($iframe) => {
    const contentWindow = $iframe.prop('contentWindow')
    return new Promise(resolve => {
      $iframe.on('load', () => {
        resolve(contentWindow)
      })
    })
  })

Cypress.Commands.add('iframeWindow',
  { prevSubject: 'element' },
  $iframe => {
    return $iframe.prop('contentWindow')
  })

Cypress.Commands.add('getInDocument',
  { prevSubject: 'document' },
  (document, selector) => cy.get(selector, { withinSubject: document })
)

Cypress.Commands.add('getInStorybook', selector => {
  return cy.get('iframe#storybook-preview-iframe')
    .iframeWindow()
    .its('document')
    .getInDocument(selector)
})

Cypress.Commands.add('visitStorybook', url => {
  return cy.visit(url)
    .get('iframe#storybook-preview-iframe')
    .iframeLoaded()
})
