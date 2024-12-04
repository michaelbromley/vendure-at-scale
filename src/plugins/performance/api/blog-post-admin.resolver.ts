import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeletionResponse, Permission } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject } from '@vendure/common/lib/shared-types';
import {
    Allow,
    Ctx,
    PaginatedList,
    RequestContext,
    Transaction,
    Relations,
    VendureEntity,
    ID,
    TranslationInput,
    ListQueryOptions,
    RelationPaths, Logger,
} from '@vendure/core';
import { BlogPostService } from '../services/blog-post.service';
import { BlogPost } from '../entities/blog-post.entity';
import {loggerCtx} from "../constants";

// These can be replaced by generated types if you set up code generation
interface CreateBlogPostInput {
    code: string;
    // Define the input fields here
    customFields?: CustomFieldsObject;
}
interface UpdateBlogPostInput {
    id: ID;
    code?: string;
    // Define the input fields here
    customFields?: CustomFieldsObject;
}

@Resolver()
export class BlogPostAdminResolver {
    constructor(private blogPostService: BlogPostService) {}

    @Query()
    @Allow(Permission.SuperAdmin)
    async blogPost(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(BlogPost) relations: RelationPaths<BlogPost>,
    ): Promise<BlogPost | null> {
        return this.blogPostService.findOne(ctx, args.id, relations);
    }

    @Query()
    @Allow(Permission.SuperAdmin)
    async blogPosts(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ListQueryOptions<BlogPost> },
        @Relations(BlogPost) relations: RelationPaths<BlogPost>,
    ): Promise<PaginatedList<BlogPost>> {
        Logger.debug('RESOLVER: blogPosts', loggerCtx);
        return this.blogPostService.findAll(ctx, args.options || undefined, relations);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async createBlogPost(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreateBlogPostInput },
    ): Promise<BlogPost> {
        return this.blogPostService.create(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async updateBlogPost(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateBlogPostInput },
    ): Promise<BlogPost> {
        return this.blogPostService.update(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async deleteBlogPost(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.blogPostService.delete(ctx, args.id);
    }
}
