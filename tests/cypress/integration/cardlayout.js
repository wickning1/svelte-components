/* global assert, cy, expect, it */

it('should show all 9 cards', () => {
  cy.visitStorybook('?path=/story/cardlayout--regular-layout')
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
  cy.visitStorybook('?path=/story/cardlayout--preserve-order')
    .getInStorybook('.cardlayout')
    .should($cardlayout => {
      let lastleft = 0
      for (let i = 1; i <= 9; i++) {
        const card = $cardlayout.find('.card' + i)
        const left = card.offset().left
        assert.isTrue(left >= lastleft)
        lastleft = left
      }
    })
})

it('should show all 9 flex cards', () => {
  cy.visitStorybook('?path=/story/cardlayout--regular-flex-layout')
    .getInStorybook('.cardlayout-card')
    .should('have.length', 9)
})

it('should place each flex card further from the top than the last', () => {
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

it('should preserve flex card order when instructed', () => {
  cy.visitStorybook('?path=/story/cardlayout--preserve-flex-order')
    .getInStorybook('.cardlayout')
    .should($cardlayout => {
      let lastleft = 0
      for (let i = 1; i <= 9; i++) {
        const card = $cardlayout.find('.card' + i)
        const left = card.offset().left
        assert.isTrue(left >= lastleft)
        lastleft = left
      }
    })
})
