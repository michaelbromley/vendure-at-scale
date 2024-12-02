import {PluginCommonModule, Type, VendurePlugin} from '@vendure/core';

import {REFERRAL_PLUGIN_OPTIONS} from './constants';
import {PluginInitOptions} from './types';
import {adminApiExtensions, shopApiExtensions} from "./api/api-extensions";
import {ReferralService} from "./service/referral.service";
import {ReferralCodeService} from "./service/referral-code.service";
import {ReferralRewardService} from "./service/referral-reward.service";

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{
        provide: REFERRAL_PLUGIN_OPTIONS,
        useFactory: () => ReferralPlugin.options
    }, ReferralService, ReferralCodeService, ReferralRewardService],
    adminApiExtensions: {
        schema: adminApiExtensions,
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
    },
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
})
export class ReferralPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<ReferralPlugin> {
        this.options = options;
        return ReferralPlugin;
    }
}
