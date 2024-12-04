import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { PERFORMANCE_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { BlogPost } from './entities/blog-post.entity';
import { BlogPostService } from './services/blog-post.service';
import { BlogPostAdminResolver } from './api/blog-post-admin.resolver';
import {adminApiExtensions, shopApiExtensions} from './api/api-extensions';
import {myApolloServerPlugin} from "./api/apollo-server-plugin";
import {MyNestMiddleware} from "./api/nestjs-middleware";
import {BlogPostShopResolver} from "./api/blog-post-shop.resolver";

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: PERFORMANCE_PLUGIN_OPTIONS, useFactory: () => PerformancePlugin.options }, BlogPostService],
    configuration: config => {
        config.apiOptions.apolloServerPlugins.push(myApolloServerPlugin());
        config.apiOptions.middleware.push({
            route: 'admin-api',
            handler: MyNestMiddleware,
        })
        return config;
    },
    compatibility: '^3.0.0',
    entities: [BlogPost],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [BlogPostAdminResolver]
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [BlogPostShopResolver]
    }
})
export class PerformancePlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<PerformancePlugin> {
        this.options = options;
        return PerformancePlugin;
    }
}
