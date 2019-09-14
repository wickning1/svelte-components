/* global Cypress, cy */
Cypress.Commands.add(
  'iframeLoaded',
  { prevSubject: 'element' },
  ($iframe) => {
    const contentWindow = $iframe.prop('contentWindow')
    return new Promise(resolve => {
      if (
        contentWindow &&
        contentWindow.document.readyState === 'complete'
      ) {
        resolve(contentWindow)
      } else {
        $iframe.on('load', () => {
          resolve(contentWindow)
        })
      }
    })
  })

Cypress.Commands.add(
  'getInDocument',
  { prevSubject: 'document' },
  (document, selector) => cy.get(selector, { withinSubject: document, timeout: 5000 })
)

Cypress.Commands.add('getInStorybook', selector => {
  cy.get('iframe#storybook-preview-iframe')
    .iframeLoaded()
    .its('document')
    .getInDocument(selector)
})
