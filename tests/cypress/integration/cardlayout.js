/* global assert, cy, expect, it */

it('should show all 9 cards', () => {
  cy.visit('?path=/story/cardlayout--regular-layout')
    .wait(200)
    .getInStorybook('.cardlayout-card')
    .should('have.length', 9)
})

it('should place each card further from the top than the last', () => {
  cy.getInStorybook('.cardlayout')
    .should($cardlayout => {
      let lastoffset = 0
      for (let i = 1; i <= 9; i++) {
        const card = $cardlayout.find('.card' + i)
        const top = card.offset().top
        expect(top).to.be.greaterThan(lastoffset - 1)
        lastoffset = top
      }
      expect(lastoffset).to.be.greaterThan(0)
    })
})

it('should preserve card order when instructed', () => {
  cy.visit('?path=/story/cardlayout--preserve-order')
    .wait(200)
    .getInStorybook('.cardlayout')
    .should($cardlayout => {
      $cardlayout.find('.cardlayout-column').each((idx, column) => {
        column.setAttribute('data-cardlayout-index', idx)
      })
      let lastcolumn = 0
      for (let i = 1; i <= 9; i++) {
        const card = $cardlayout.find('.card' + i)
        const colidx = card.closest('.cardlayout-column').data('cardlayout-index')
        assert.isTrue(colidx === lastcolumn || colidx === lastcolumn + 1)
        lastcolumn = colidx
      }
    })
})
