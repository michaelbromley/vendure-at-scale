import { Injectable } from '@nestjs/common';
import { pick } from '@vendure/common/lib/pick';
import {
    Customer,
    EntityHydrator,
    ID,
    ListQueryBuilder,
    Logger,
    Order,
    patchEntity,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';

import { Referral } from '../entities/referral.entity';
import { ReferralListOptions, ReferralState, UpdateReferralInput } from '../gql/generated';
import { SetReferralResult, ShopReferral } from '../gql/generated-shop';

import { ReferralCodeService } from './referral-code.service';
import { ReferralRewardService } from './referral-reward.service';

@Injectable()
export class ReferralService {
    constructor(
        private connection: TransactionalConnection,
        private referralCodeService: ReferralCodeService,
        private referralRewardService: ReferralRewardService,
        private listQueryBuilder: ListQueryBuilder,
        private entityHydrator: EntityHydrator,
    ) {}

    findOne(ctx: RequestContext, id: ID) {
        return this.connection.getRepository(ctx, Referral).findOne({
            where: { id },
            relations: ['customer', 'referredBy', 'order'],
        });
    }

    findMany(ctx: RequestContext, options: ReferralListOptions) {
        return this.listQueryBuilder
            .build(Referral, options, {
                ctx,
                relations: ['customer', 'referredBy', 'order'],
                customPropertyMap: {
                    customerLastName: 'customer.lastName',
                    referredByLastName: 'referredBy.lastName',
                }
            })
            .getManyAndCount()
            .then(([items, totalItems]) => {
                return { items, totalItems };
            });
    }

    findManyByReferrerId(ctx: RequestContext, referrerCustomerId: ID, options: ReferralListOptions) {
        const qb = this.listQueryBuilder
            .build(Referral, options, {
                ctx,
                relations: ['customer', 'referredBy', 'order'],
            })
            .andWhere(`referral.referredBy.id = :referrerId`, { referrerId: referrerCustomerId });

        return qb.getManyAndCount().then(([items, totalItems]) => {
            const shopReferralItems: ShopReferral[] = items.map((item) => {
                return {
                    ...pick(item, ['state', 'createdAt', 'updatedAt']),
                    id: item.id as string,
                    note: item.publicNote,
                    customerName: item.customer.firstName + ' ' + item.customer.lastName,
                    rewardPointsEarned: item.rewardPointsEarned,
                };
            });
            return { items: shopReferralItems, totalItems };
        });
    }

    async createReferralForOrder(ctx: RequestContext, order: Order): Promise<Referral | undefined> {
        const { referralCode } = order.customFields;
        if (!referralCode || !order.customer) {
            return;
        }
        const referredBy = await this.referralCodeService.getCustomerFromReferralCode(ctx, referralCode);
        const existingReferral = referredBy && (await this.connection.getRepository(ctx, Referral).findOne({
            where: {
                customer: { id: order.customer.id },
                referredBy: { id: referredBy.id },
            },
        }));
        if (existingReferral) {
            Logger.warn(
                `Referral already exists for customer ${order.customer.id} (${order.customer.emailAddress}) and referrer ${referredBy.id} (${referredBy.emailAddress})`,
            );
            return;
        }
        const referral = new Referral({
            customer: order.customer,
            order,
            referredBy,
            state: ReferralState.PENDING,
            rewardGranted: false,
        });
        return this.connection.getRepository(ctx, Referral).save(referral);
    }

    /**
     * Returns the Customer's referral code, and if not yet set it generates a new one.
     */
    async getReferralCodeForCustomer(ctx: RequestContext, customerId: ID): Promise<string> {
        const customer = await this.connection.getEntityOrThrow(ctx, Customer, customerId);
        if (customer.customFields.referralCode != null) {
            return customer.customFields.referralCode;
        }
        customer.customFields.referralCode = await this.referralCodeService.generateReferralCode(ctx);
        await this.connection.getRepository(ctx, Customer).save(customer);
        return customer.customFields.referralCode;
    }

    async setReferralCodeOnOrder(
        ctx: RequestContext,
        order: Order,
        code: string,
    ): Promise<SetReferralResult> {
        const eligible = this.isEligibleForReferralCode(ctx, order);
        if (eligible !== true) {
            return {
                success: false,
                errorMessage: eligible,
            };
        }
        const referredBy = await this.referralCodeService.getCustomerFromReferralCode(ctx, code);
        if (!referredBy) {
            return {
                success: false,
                errorMessage: `The referral code "${code}" was not recognised. Please check and try again`,
            };
        }
        await this.entityHydrator.hydrate(ctx, order, { relations: ['lines', 'shippingLines'] });
        const referredByName = `${referredBy.firstName} ${referredBy.lastName}`;
        order.customFields.referralCode = code;
        order.customFields.referredBy = referredByName;
        await this.connection.getRepository(ctx, Order).save(order);
        return {
            success: true,
            referredByName,
        };
    }

    async updateReferral(ctx: RequestContext, input: UpdateReferralInput) {
        const referral = await this.connection.getEntityOrThrow(ctx, Referral, input.id);
        const initialState = referral.state;
        patchEntity(referral, input);
        await this.connection.getRepository(ctx, Referral).save(referral);
        if (initialState !== ReferralState.APPROVED && input.state === ReferralState.APPROVED) {
            await this.referralRewardService.applyReward(ctx, referral.id);
        }
        return this.findOne(ctx, referral.id);
    }

    private isEligibleForReferralCode(ctx: RequestContext, order: Order): true | string {
        if (ctx.activeUserId) {
            return `Customers with existing accounts are not eligible for the referral program.`;
        }
        return true;
    }
}
