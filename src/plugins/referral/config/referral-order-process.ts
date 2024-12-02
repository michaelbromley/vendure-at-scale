import { CustomOrderProcess, OrderState } from '@vendure/core';

import { ReferralService } from '../service/referral.service';

let referralService: ReferralService;

export const referralOrderProcess: CustomOrderProcess<OrderState> = {
    init: (injector) => {
        referralService = injector.get(ReferralService);
    },
    onTransitionEnd: async (fromState, toState, data) => {
        const { order, ctx } = data;
        if (toState === 'PaymentSettled') {
            if (order.customFields.referralCode) {
                await referralService.createReferralForOrder(ctx, order);
            }
        }
    },
};
