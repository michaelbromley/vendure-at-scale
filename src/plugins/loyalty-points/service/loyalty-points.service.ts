import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {
    Customer,
    CustomerService,
    EntityHydrator,
    ID,
    LanguageCode,
    Logger,
    Order,
    OrderCalculator,
    OrderService,
    PaymentMethodService,
    PromotionService,
    Refund,
    RequestContext,
    RequestContextService,
    ShippingLine,
    TransactionalConnection,
    UserInputError
} from "@vendure/core";
import {LoyaltyPointsTransaction} from '../entities/loyalty-points-transaction.entity';
import {LoyaltyPointsTransactionInput, LoyaltyTransactionType} from '../gql/generated';
import {loyaltyPointsPaymentMethodHandler} from '../config/loyalty-points-payment-method-handler';
import {loggerCtx} from '../constants';
import {loyaltyPointsPaymentEligibilityChecker} from '../config/loyalty-points-payment-eligibility-checker';

@Injectable()
export class LoyaltyPointsService implements OnApplicationBootstrap {
    constructor(
        private connection: TransactionalConnection,
        private promotionService: PromotionService,
        private customerService: CustomerService,
        private orderService: OrderService,
        private orderCalculator: OrderCalculator,
        private entityHydrator: EntityHydrator,
        private paymentMethodService: PaymentMethodService,
        private requestContextService: RequestContextService,
    ) {}

    async onApplicationBootstrap() {
        await this.ensureLoyaltyPointsPaymentMethodExists();
    }

    async ensureLoyaltyPointsPaymentMethodExists() {
        const ctx = await this.requestContextService.create({
            apiType: 'admin',
        });
        const { items } = await this.paymentMethodService.findAll(ctx);
        const loyaltyPointsPaymentMethod = items.find((i) => i.code === loyaltyPointsPaymentMethodHandler.code);
        if (!loyaltyPointsPaymentMethod) {
            Logger.info(`No reward points payment method found, attempting to create...`, loggerCtx);
            // TODO v2: Update after codegen
            const input = {
                code: loyaltyPointsPaymentMethodHandler.code,
                enabled: true,
                checker: {
                    code: loyaltyPointsPaymentEligibilityChecker.code,
                    arguments: [],
                },
                handler: {
                    code: loyaltyPointsPaymentMethodHandler.code,
                    arguments: [],
                },
                translations: [
                    {
                        languageCode: LanguageCode.en,
                        name: 'Reward points payment',
                        description: '',
                    },
                ],
            };
            const result = await this.paymentMethodService.create(ctx, input);
            Logger.info(`Created reward points payment method, id: ${result.id}`, loggerCtx);
        }
    }

    async addPointsFromCompletedOrder(ctx: RequestContext, order: Order) {
        const customer = order.customer;
        if (customer) {
            const pointsEarned = Math.round(order.subTotalWithTax / 100);

            if (0 < pointsEarned) {
                await this.createLoyaltyPointsTransaction(ctx, {
                    customer,
                    order,
                    note: '',
                    type: LoyaltyTransactionType.EARNED_ON_ORDER,
                    value: pointsEarned,
                });
            }
        }
    }

    async removePointsFromRefundedOrder(ctx: RequestContext, order: Order, refund: Refund) {
        await this.entityHydrator.hydrate(ctx, order, { relations: ['customer'] });
        const customer = order.customer;
        if (customer) {
            const pointsToDeduct = Math.round(refund.items / 100);
            await this.createLoyaltyPointsTransaction(ctx, {
                customer,
                order,
                note: refund.reason ?? '',
                type: LoyaltyTransactionType.ORDER_CANCELLED,
                value: -pointsToDeduct,
            });
        }
    }

    async createPointsAdjustment(
        ctx: RequestContext,
        input: LoyaltyPointsTransactionInput,
    ): Promise<LoyaltyPointsTransaction> {
        const customer = await this.connection.getEntityOrThrow(ctx, Customer, input.customerId);
        if ((customer.customFields as any).loyaltyPointsTotal + input.value < 0) {
            throw new UserInputError('Cannot adjust reward points below zero');
        }
        return this.createLoyaltyPointsTransaction(ctx, {
            type: LoyaltyTransactionType.ADMINISTRATOR_ADJUSTED,
            customer,
            value: input.value,
            note: input.note,
        });
    }

    async applyLoyaltyPointsToActiveOrder(ctx: RequestContext, amount: number): Promise<Order | undefined> {
        if (ctx.session && ctx.session.activeOrderId && ctx.activeUserId) {
            const activeOrder = await this.connection.getEntityOrThrow(
                ctx,
                Order,
                ctx.session.activeOrderId,
                { channelId: ctx.channelId },
            );
            const customer = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
            const order = await this.orderService.findOne(ctx, activeOrder.id);
            if (customer && order) {
                const effectivePointsUsed = this.effectiveLoyaltyPointsUsed(order, customer, amount);
                order.customFields.loyaltyPointsUsed = effectivePointsUsed;
                const promotions = await this.promotionService.findAll(ctx, {
                    filter: { enabled: { eq: true } },
                });
                const updatedOrder = await this.orderCalculator.applyPriceAdjustments(
                    ctx,
                    order,
                    promotions.items,
                );
                await this.connection.getRepository(ctx, Order).save(updatedOrder, { reload: false });
                await this.connection
                    .getRepository(ctx, ShippingLine)
                    .save(order.shippingLines, { reload: false });
                return this.connection.getRepository(ctx, Order).save(order);
            }
        }
    }

    async getPointsEarnedOnOrder(ctx: RequestContext, orderId: ID): Promise<number> {
        const transaction = await this.connection.getRepository(ctx, LoyaltyPointsTransaction).findOne({
            where: {
                order: { id: orderId },
            },
            order: {
                value: 'DESC',
            }
        });
        if (transaction) {
            return transaction.value;
        }
        return 0;
    }

    async createLoyaltyPointsTransaction(
        ctx: RequestContext,
        input: {
            customer: Customer;
            order?: Order;
            note: string;
            value: number;
            type: LoyaltyTransactionType;
        },
    ): Promise<LoyaltyPointsTransaction> {
        const { customer, order, note, value, type } = input;
        await this.connection.getRepository(ctx, Customer).update(
            { id: customer.id },
            {
                customFields: {
                    loyaltyPointsAvailable: customer.customFields.loyaltyPointsAvailable + value,
                },
            },
        );
        return await this.connection.getRepository(ctx, LoyaltyPointsTransaction).save(
            new LoyaltyPointsTransaction({
                customer,
                order,
                note,
                type,
                value,
            }),
        );
    }

    private effectiveLoyaltyPointsUsed(order: Order, customer: Customer, amount?: number) {
        return Math.min(
            amount ?? order.customFields.loyaltyPointsUsed ?? Number.MAX_SAFE_INTEGER,
            order.lines.reduce((sum, line) => sum + line.discountedLinePriceWithTax, 0) +
                order.shippingLines.reduce((sum, sl) => sum + sl.priceWithTax, 0),
            customer.customFields.loyaltyPointsAvailable,
        );
    }
}
