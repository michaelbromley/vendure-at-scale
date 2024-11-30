import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {Ctx, Order, RequestContext} from '@vendure/core';

import {LoyaltyPointsService} from '../service/loyalty-points.service';

@Resolver('Order')
export class OrderEntityResolver {
    constructor(private loyaltyPointsService: LoyaltyPointsService) {
    }

    @ResolveField()
    loyaltyPointsEarned(@Ctx() ctx: RequestContext, @Parent() order: Order) {
        return this.loyaltyPointsService.getPointsEarnedOnOrder(ctx, order.id);
    }
}
