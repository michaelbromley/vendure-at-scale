import { EntityHydrator, LanguageCode, PaymentMethodHandler } from '@vendure/core';

import { LoyaltyPointsService } from '../service/loyalty-points.service';
import { LoyaltyTransactionType } from '../gql/generated';
import { LOYALTY_POINTS_PAYMENT_METHOD_CODE } from '../constants';

let rewardsService: LoyaltyPointsService;
let entityHydrator: EntityHydrator;

export const loyaltyPointsPaymentMethodHandler = new PaymentMethodHandler({
    code: LOYALTY_POINTS_PAYMENT_METHOD_CODE,
    description: [{ languageCode: LanguageCode.en, value: 'Payment using loyalty points' }],
    args: {},
    init: (injector) => {
        rewardsService = injector.get(LoyaltyPointsService);
        entityHydrator = injector.get(EntityHydrator);
    },
    createPayment: async (ctx, order, amount, args, metadata) => {
        const rewardPointsUsed = order.customFields.loyaltyPointsUsed;
        if (rewardPointsUsed === 0) {
            return {
                state: 'Error',
                amount,
                errorMessage: 'No reward points have been used on this order',
            };
        }
        if (!order.customer) {
            return {
                state: 'Error',
                amount,
                errorMessage: 'No customer associated with this order',
            };
        }
        const transaction = await rewardsService.createLoyaltyPointsTransaction(ctx, {
            customer: order.customer,
            value: -rewardPointsUsed,
            type: LoyaltyTransactionType.USED_ON_ORDER,
            note: '',
            order,
        });
        return {
            state: 'Settled',
            amount: rewardPointsUsed,
            transactionId: 'reward-points-' + transaction.id.toString(),
            metadata: {
                rewardPointsTransactionId: transaction.id,
                rewardPointsUsed,
                paymentId: metadata.paymentId ?? '',
                public: {
                    rewardPointsUsed,
                },
            },
        };
    },
    settlePayment: (ctx, order, payment, args) => {
        return {
            success: true,
        };
    },
    createRefund: async (ctx, input, amount, order, payment, args) => {
        await entityHydrator.hydrate(ctx, order, { relations: ['customer'] });
        if (!order.customer) {
            return {
                state: 'Failed',
            }
        }
        const transaction = await rewardsService.createLoyaltyPointsTransaction(ctx, {
            customer: order.customer,
            order,
            note: input.reason ?? '',
            type: LoyaltyTransactionType.ORDER_CANCELLED,
            value: amount,
        });
        return {
            state: 'Settled',
            transactionId: 'reward-points-' + transaction.id.toString(),
            metadata: {
                rewardPointsRefunded: amount,
            },
        };
    },
    cancelPayment: async (ctx, order, payment, args) => {
        await entityHydrator.hydrate(ctx, order, { relations: ['customer'] });
        if (!order.customer) {
            return {
                success: false,
                errorMessage: 'No customer associated with this order',
            }
        }
        const transaction = await rewardsService.createLoyaltyPointsTransaction(ctx, {
            customer: order.customer,
            order,
            note: 'Reward points payment cancelled',
            type: LoyaltyTransactionType.OTHER,
            value: payment.amount,
        });
        return {
            success: true,
            metadata: {
                rewardPointsRestored: payment.amount,
                cancellationTransactionId: transaction.id,
            },
        };
    },
});
