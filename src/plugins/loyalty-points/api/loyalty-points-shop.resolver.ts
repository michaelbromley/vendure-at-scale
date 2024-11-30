import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {Ctx, RequestContext} from '@vendure/core';

import {LoyaltyPointsService} from '../service/loyalty-points.service';

@Resolver()
export class LoyaltyPointsShopResolver {
    constructor(private rewardsService: LoyaltyPointsService) {}

    @Mutation()
    applyLoyaltyPointsToActiveOrder(@Ctx() ctx: RequestContext, @Args() { amount }: {
        amount: number;
    }) {
        return this.rewardsService.applyLoyaltyPointsToActiveOrder(ctx, amount);
    }
}
