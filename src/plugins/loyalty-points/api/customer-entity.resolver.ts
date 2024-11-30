import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, Customer, ListQueryBuilder, RequestContext } from '@vendure/core';

import { LoyaltyPointsTransaction } from '../entities/loyalty-points-transaction.entity';
import { CustomerLoyaltyPointsTransactionsArgs } from '../gql/generated';

@Resolver('Customer')
export class CustomerEntityResolver {
    constructor(private listQueryBuilder: ListQueryBuilder) {}

    @ResolveField()
    loyaltyPointsTransactions(
        @Ctx() ctx: RequestContext,
        @Parent() customer: Customer,
        @Args() { options }: CustomerLoyaltyPointsTransactionsArgs,
    ) {
        return this.listQueryBuilder
            .build(LoyaltyPointsTransaction, options, {
                where: {
                    customer: { id: customer.id },
                },
                relations: ['order'],
            })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }
}
