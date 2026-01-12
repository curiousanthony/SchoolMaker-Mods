import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'horizontal-payment-plans',
  name: 'Horizontal Payment Plans',
  description: 'Changes the payment plan selection to a horizontal pricing table and makes the "Next" button full width.',
  category: 'Appearance',
  tags: ['payment', 'pricing', 'ui', 'layout', 'checkout'],
  enabled: false,
  published: true,
  modType: 'css',
  previewEnabled: true,
  mediaBeforeUrl: '/images/mods/horizontal-payment-plans-before.png',
  mediaUrl: '/images/mods/horizontal-payment-plans-after.png',
  cssString: `
/* --- Offer Page Mod: Horizontal Payment Plans & Full-Width Button --- */

/* Horizontal direction for pricing table on desktop */
body.front-office-offers form[action="/subscriptions/new"] > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

body.front-office-offers form[action="/subscriptions/new"] > div:first-child > div.offers-price {
  width: 100%;
}

/* Style for the selected pricing item */
body.front-office-offers main .card-offers .offers-price input[type="radio"]:checked + label {
  background-color: var(--color-primary-50) !important;
  box-shadow: 0 0 0 2px var(--color-primary-500) !important;
}

/* Adjust vertical padding for all pricing items */
body.front-office-offers main .card-offers .offers-price input[type="radio"] + label {
  padding-block: 1.6rem !important;
}

body.front-office-offers main .card-offers .offers-price input[type="radio"] + label > div:nth-child(2) {
  padding-right: 3rem;
}

/* Color for the checkmark icon */
body.front-office-offers main .card-offers .offers-price input[type="radio"]:checked + label::after {
  color: var(--color-primary-500) !important;
}

/* Position for the checkmark icon */
body.front-office-offers main .card-offers .offers-price input[type="radio"] + label::after {
  right: 1rem !important;
  top: 1.4rem !important;
}

/* Make the "Next" button full width */
.button-primary-lg {
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
  padding-top: .75rem !important;
  padding-bottom: .75rem !important;
  font-size: 1rem !important;
  line-height: 1.5rem !important;
  width: 100% !important;
}

/* Ensure the button's container takes full width on large screens */
@media (min-width: 992px) {
  .card-offers div.col-lg-4:has(button) {
    max-width: 100% !important;
    flex: 1 !important;
  }
}

/* Stack payment plans vertically on mobile */
@media (max-width: 767px) {
  body.front-office-offers form[action="/subscriptions/new"] > div:first-child {
    flex-direction: column;
    gap: .7rem;
  }
}
  `,
};
