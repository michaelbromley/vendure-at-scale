/**
 * @description
 * The plugin can be configured using the following options:
 */
export interface PluginInitOptions {
    exampleOption?: string;
}

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    export interface CustomCustomerFields {
        loyaltyPointsAvailable: number;
    }
    export interface CustomOrderFields {
        loyaltyPointsUsed: number;
    }
}
