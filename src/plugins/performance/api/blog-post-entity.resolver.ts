import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import {Ctx, RequestContext, ProductVariant, Logger} from '@vendure/core';
import {BlogPost} from "../entities/blog-post.entity";
import {loggerCtx} from "../constants";
import {BlogPostService} from "../services/blog-post.service";

@Resolver('BlogPost')
export class BlogPostEntityResolver {

    constructor(private blogPostService: BlogPostService) {}

    @ResolveField()
    title(@Ctx() ctx: RequestContext, @Parent() post: BlogPost) {
        Logger.verbose(`RESOLVER: BlogPost.title`, loggerCtx);
        return post.title;
    }

    @ResolveField()
    content(@Ctx() ctx: RequestContext, @Parent() post: BlogPost) {
        Logger.verbose(`RESOLVER: BlogPost.content`, loggerCtx);
        return this.blogPostService.getContent(ctx, post.id);
    }
}