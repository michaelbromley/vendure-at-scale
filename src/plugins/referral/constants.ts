import {CrudPermissionDefinition} from "@vendure/core";

export const REFERRAL_PLUGIN_OPTIONS = Symbol('REFERRAL_PLUGIN_OPTIONS');
export const loggerCtx = 'ReferralPlugin';
export const referral = new CrudPermissionDefinition('Referral');