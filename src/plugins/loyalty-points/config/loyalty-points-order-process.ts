import { OrderProcess, Injector, OrderState, OrderTransitionData } from '@vendure/core';

import { LoyaltyPointsService } from '../service/loyalty-points.service';

export class LoyaltyPointsOrderProcess implements OrderProcess<OrderState> {
    private loyaltyPointsService: LoyaltyPointsService;

    init(injector: Injector) {
        this.loyaltyPointsService = injector.get(LoyaltyPointsService);
    }

    async onTransitionEnd(fromState: OrderState, toState: OrderState, data: OrderTransitionData) {
        if (fromState === 'AddingItems' && toState === 'ArrangingPayment') {
            const order = await this.loyaltyPointsService.applyLoyaltyPointsToActiveOrder(
                data.ctx,
                data.order.customFields.loyaltyPointsUsed,
            );
            if (order) {
                data.order.customFields.loyaltyPointsUsed = order.customFields.loyaltyPointsUsed;
            }
        }
        if (
            toState === 'PaymentSettled' &&
            (fromState === 'ArrangingPayment' || fromState === 'PaymentAuthorized')
        ) {
            await this.loyaltyPointsService.addPointsFromCompletedOrder(data.ctx, data.order);
        }
    }
}
