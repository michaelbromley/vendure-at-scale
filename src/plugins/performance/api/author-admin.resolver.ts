import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeletionResponse, Permission } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject } from '@vendure/common/lib/shared-types';
import {
    Allow,
    Ctx,
    ID,
    ListQueryOptions,
    PaginatedList,
    RelationPaths,
    Relations,
    RequestContext,
    Transaction
} from '@vendure/core';
import { Author } from '../entities/author.entity';
import { AuthorService } from '../services/author.service';
import {CreateAuthorInput, UpdateAuthorInput} from "../gql/generated";

@Resolver()
export class AuthorAdminResolver {
    constructor(private authorService: AuthorService) {}

    @Query()
    @Allow(Permission.SuperAdmin)
    async author(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(Author) relations: RelationPaths<Author>,
    ): Promise<Author | null> {
        return this.authorService.findOne(ctx, args.id, relations);
    }

    @Query()
    @Allow(Permission.SuperAdmin)
    async authors(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ListQueryOptions<Author> },
        @Relations(Author) relations: RelationPaths<Author>,
    ): Promise<PaginatedList<Author>> {
        return this.authorService.findAll(ctx, args.options || undefined, relations);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async createAuthor(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreateAuthorInput },
    ): Promise<Author> {
        return this.authorService.create(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async updateAuthor(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateAuthorInput },
    ): Promise<Author> {
        return this.authorService.update(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async deleteAuthor(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.authorService.delete(ctx, args.id);
    }
}
