import { LoyaltyPointsService, LoyaltyTransactionType } from '../../loyalty-points';
import { Injectable } from '@nestjs/common';
import { ID, RequestContext, TransactionalConnection } from '@vendure/core';

import { Referral } from '../entities/referral.entity';
import { ReferralState } from '../gql/generated';

/**
 * @description
 * This class is responsible for implementing the "reward" logic to apply the rewards to the Customer and
 * the referrer once a Referral is approved.
 */
@Injectable()
export class ReferralRewardService {
    /**
     * How many times the regular reward points does the customer earn from being referred?
     */
    private readonly CUSTOMER_POINTS_FACTOR = 5;
    /**
     * What percentage of the new customer's order is awarded to the referrer in the form of
     * reward point?
     */
    private readonly REFERRER_ORDER_PERCENTAGE = 10;
    /**
     * What is the upper limit of points that a referrer can earn from a single referral?
     */
    private readonly REFERRER_MAX_POINTS = 500;

    constructor(private connection: TransactionalConnection, private loyaltyPointsService: LoyaltyPointsService) {}

    async applyReward(ctx: RequestContext, referralId: ID) {
        const referral = await this.connection.getEntityOrThrow(ctx, Referral, referralId, {
            relations: ['customer', 'order', 'referredBy'],
        });
        if (referral.rewardGranted === true || referral.state !== ReferralState.APPROVED) {
            return referral;
        }
        const customerPoints =
            Math.round(referral.order.subTotalWithTax / 100) * (this.CUSTOMER_POINTS_FACTOR - 1);

        const referrerPoints = Math.min(
            Math.round((referral.order.subTotalWithTax * this.REFERRER_ORDER_PERCENTAGE) / 100),
            this.REFERRER_MAX_POINTS,
        );

        await this.loyaltyPointsService.createLoyaltyPointsTransaction(ctx, {
            customer: referral.customer,
            type: LoyaltyTransactionType.OTHER,
            value: customerPoints,
            note: `Referral program sign-up bonus, (Referral ID ${referral.id})`,
        });

        await this.loyaltyPointsService.createLoyaltyPointsTransaction(ctx, {
            customer: referral.referredBy,
            type: LoyaltyTransactionType.OTHER,
            value: referrerPoints,
            note: `Referral program award for referring ${referral.customer.firstName} ${referral.customer.lastName} (Referral ID: ${referral.id})`,
        });

        referral.rewardGranted = true;
        referral.rewardPointsEarned = referrerPoints;
        await this.connection.getRepository(ctx, Referral).save(referral);
    }
}
