import {Args, Query, Resolver} from '@nestjs/graphql';
import {
    Ctx,
    ID,
    ListQueryOptions,
    Logger,
    PaginatedList,
    RelationPaths,
    Relations,
    RequestContext,
} from '@vendure/core';
import {BlogPostService} from '../services/blog-post.service';
import {BlogPost} from '../entities/blog-post.entity';
import {loggerCtx} from "../constants";

@Resolver()
export class BlogPostShopResolver {
    constructor(private blogPostService: BlogPostService) {
    }

    @Query()
    async blogPost(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(BlogPost) relations: RelationPaths<BlogPost>,
    ): Promise<BlogPost | null> {
        return this.blogPostService.findOne(ctx, args.id, relations);
    }

    @Query()
    async blogPosts(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ListQueryOptions<BlogPost> },
        @Relations(BlogPost) relations: RelationPaths<BlogPost>,
    ): Promise<PaginatedList<BlogPost>> {
        Logger.verbose('RESOLVER: blogPosts', loggerCtx);
        return this.blogPostService.findAll(ctx, args.options || undefined, relations);
    }
}
