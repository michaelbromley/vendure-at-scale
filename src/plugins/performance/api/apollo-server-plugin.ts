import { ApolloServerPlugin } from '@apollo/server';
import {Logger} from "@vendure/core";
import {loggerCtx} from "../constants";

export function myApolloServerPlugin (): ApolloServerPlugin {
    return {
        async requestDidStart({ contextValue }) {
            Logger.debug('MIDDLEWARE: myApolloServerPlugin.requestDidStart', loggerCtx);
            return {
                async executionDidStart() {
                    Logger.debug('MIDDLEWARE: myApolloServerPlugin.executionDidStart', loggerCtx);
                },
                async willSendResponse() {
                    Logger.debug('MIDDLEWARE: myApolloServerPlugin.willSendResponse', loggerCtx);
                }
            }
        },
    };
};