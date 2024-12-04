import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import {Ctx, RequestContext, ProductVariant, Logger} from '@vendure/core';
import {BlogPost} from "../entities/blog-post.entity";
import {loggerCtx} from "../constants";

@Resolver('BlogPost')
export class BlogPostEntityResolver {

    @ResolveField()
    title(@Ctx() ctx: RequestContext, @Parent() post: BlogPost) {
        Logger.debug(`RESOLVER: BlogPost.title`, loggerCtx);
    }

    @ResolveField()
    content(@Ctx() ctx: RequestContext, @Parent() post: BlogPost) {
        Logger.debug(`RESOLVER: BlogPost.content`, loggerCtx);
    }
}