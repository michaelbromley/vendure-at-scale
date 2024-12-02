import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext } from '@vendure/core';

import { referral } from '../constants';
import { MutationUpdateReferralArgs, QueryReferralArgs, QueryReferralsArgs } from '../gql/generated';
import { ReferralService } from '../service/referral.service';

@Resolver()
export class ReferralAdminResolver {
    constructor(private referralService: ReferralService) {}

    @Query()
    @Allow(referral.Read)
    referrals(@Ctx() ctx: RequestContext, @Args() args: QueryReferralsArgs) {
        return this.referralService.findMany(ctx, args.options ?? {});
    }
    @Query()
    @Allow(referral.Read)
    referral(@Ctx() ctx: RequestContext, @Args() args: QueryReferralArgs) {
        return this.referralService.findOne(ctx, args.id);
    }

    @Mutation()
    @Allow(referral.Update)
    updateReferral(@Ctx() ctx: RequestContext, @Args() args: MutationUpdateReferralArgs) {
        return this.referralService.updateReferral(ctx, args.input);
    }
}
