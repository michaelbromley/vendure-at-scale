import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
    ActiveOrderService,
    Allow,
    Ctx,
    CustomerService,
    PaginatedList,
    Permission,
    RequestContext,
} from '@vendure/core';

import {
    MutationSetReferralCodeArgs,
    QueryActiveCustomerReferralsArgs,
    SetReferralResult,
    ShopReferral,
} from '../gql/generated-shop';
import { ReferralService } from '../service/referral.service';

@Resolver()
export class ReferralShopResolver {
    constructor(
        private customerService: CustomerService,
        private referralService: ReferralService,
        private activeOrderService: ActiveOrderService,
    ) {}

    @Query()
    @Allow(Permission.Owner)
    async activeCustomerReferralCode(@Ctx() ctx: RequestContext) {
        const userId = ctx.activeUserId;
        if (userId) {
            const customer = await this.customerService.findOneByUserId(ctx, userId);
            if (!customer) {
                return null;
            }
            return this.referralService.getReferralCodeForCustomer(ctx, customer.id);
        }
    }

    @Query()
    @Allow(Permission.Owner)
    async activeCustomerReferrals(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryActiveCustomerReferralsArgs,
    ): Promise<PaginatedList<ShopReferral>> {
        const userId = ctx.activeUserId;
        if (userId) {
            const customer = await this.customerService.findOneByUserId(ctx, userId);
            if (customer) {
                return this.referralService.findManyByReferrerId(ctx, customer.id, args.options || {});
            }
        }
        return {
            items: [],
            totalItems: 0,
        };
    }

    @Mutation()
    @Allow(Permission.Owner)
    async setReferralCode(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationSetReferralCodeArgs,
    ): Promise<SetReferralResult> {
        const order = await this.activeOrderService.getOrderFromContext(ctx, true);
        return this.referralService.setReferralCodeOnOrder(ctx, order, args.code);
    }
}
