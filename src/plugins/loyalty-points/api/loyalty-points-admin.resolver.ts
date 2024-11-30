import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {Allow, Ctx, Permission, RequestContext} from '@vendure/core';

import {MutationCreateLoyaltyPointsTransactionArgs} from '../gql/generated';
import {LoyaltyPointsService} from '../service/loyalty-points.service';

@Resolver()
export class LoyaltyPointsAdminResolver {
    constructor(private loyaltyPointsService: LoyaltyPointsService) {}

    @Mutation()
    @Allow(Permission.UpdateCustomer)
    createLoyaltyPointsTransaction(
        @Ctx() ctx: RequestContext,
        @Args() { input }: MutationCreateLoyaltyPointsTransactionArgs,
    ) {
        return this.loyaltyPointsService.createPointsAdjustment(ctx, input);
    }
}
