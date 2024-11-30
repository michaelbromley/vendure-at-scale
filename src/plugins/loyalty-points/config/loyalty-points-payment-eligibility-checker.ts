import { LanguageCode, PaymentMethodEligibilityChecker } from '@vendure/core';

export const loyaltyPointsPaymentEligibilityChecker = new PaymentMethodEligibilityChecker({
    code: 'loyalty-points-payment-eligibility',
    description: [
        { languageCode: LanguageCode.en, value: 'Eligible if the order has loyalty points applied' },
    ],
    args: {},
    check: async (ctx, order) => {
        return 0 < order.customFields.loyaltyPointsUsed;
    },
});
