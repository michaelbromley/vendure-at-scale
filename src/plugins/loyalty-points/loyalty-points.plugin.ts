import * as path from 'path';
import {AdminUiExtension} from '@vendure/ui-devkit/compiler';
import {LanguageCode, PluginCommonModule, Type, VendurePlugin} from '@vendure/core';

import {LOYALTY_POINTS_PLUGIN_OPTIONS} from './constants';
import {PluginInitOptions} from './types';
import {LoyaltyPointsTransaction} from './entities/loyalty-points-transaction.entity';
import {adminApiExtensions, shopApiExtensions} from "./api/api-extensions";
import {loyaltyPointsPaymentEligibilityChecker} from "./config/loyalty-points-payment-eligibility-checker";
import {loyaltyPointsPaymentMethodHandler} from "./config/loyalty-points-payment-method-handler";
import {LoyaltyPointsOrderProcess} from "./config/loyalty-points-order-process";
import {LoyaltyPointsAdminResolver} from "./api/loyalty-points-admin.resolver";
import {CustomerEntityResolver} from "./api/customer-entity.resolver";
import {LoyaltyPointsShopResolver} from "./api/loyalty-points-shop.resolver";
import {OrderEntityResolver} from "./api/order-entity.resolver";
import {LoyaltyPointsService} from "./service/loyalty-points.service";

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{
        provide: LOYALTY_POINTS_PLUGIN_OPTIONS,
        useFactory: () => LoyaltyPointsPlugin.options
    }, LoyaltyPointsService],
    exports: [LoyaltyPointsService],
    configuration: config => {
        config.customFields.Customer.push({
            name: 'loyaltyPointsAvailable',
            type: 'int',
            defaultValue: 0,
            public: true,
            readonly: true,
            label: [{languageCode: LanguageCode.en, value: 'Total loyalty points available to use'}],
            ui: {component: 'customer-points-link'},
        });
        config.customFields.Order.push({
            name: 'loyaltyPointsUsed',
            type: 'int',
            defaultValue: 0,
            public: true,
            readonly: true,
            label: [{languageCode: LanguageCode.en, value: 'Loyalty points used on this order'}],
        });
        config.paymentOptions.paymentMethodEligibilityCheckers?.push(loyaltyPointsPaymentEligibilityChecker);
        config.paymentOptions.paymentMethodHandlers.push(loyaltyPointsPaymentMethodHandler);
        config.orderOptions.process.push(new LoyaltyPointsOrderProcess());
        return config;
    },
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [LoyaltyPointsAdminResolver, CustomerEntityResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [LoyaltyPointsShopResolver, CustomerEntityResolver, OrderEntityResolver],
    },
    compatibility: '^3.0.0',
    entities: [LoyaltyPointsTransaction],
})
export class LoyaltyPointsPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<LoyaltyPointsPlugin> {
        this.options = options;
        return LoyaltyPointsPlugin;
    }

    static ui: AdminUiExtension = {
        id: 'loyalty-points-ui',
        extensionPath: path.join(__dirname, 'ui'),
        routes: [{route: 'loyalty-points', filePath: 'routes.ts'}],
        providers: ['providers.ts'],
    };
}
