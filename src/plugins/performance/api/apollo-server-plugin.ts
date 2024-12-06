import { ApolloServerPlugin } from '@apollo/server';
import {Logger} from "@vendure/core";
import {loggerCtx} from "../constants";

export function myApolloServerPlugin (): ApolloServerPlugin {
    return {
        async requestDidStart({ contextValue }) {
            Logger.verbose('MIDDLEWARE: myApolloServerPlugin.requestDidStart', loggerCtx);
            return {
                async executionDidStart() {
                    Logger.verbose('MIDDLEWARE: myApolloServerPlugin.executionDidStart', loggerCtx);
                },
                async willSendResponse() {
                    Logger.verbose('MIDDLEWARE: myApolloServerPlugin.willSendResponse', loggerCtx);
                }
            }
        },
    };
};