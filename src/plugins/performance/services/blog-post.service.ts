import {Inject, Injectable} from '@nestjs/common';
import {DeletionResponse, DeletionResult} from '@vendure/common/lib/generated-types';
import {ID, PaginatedList} from '@vendure/common/lib/shared-types';
import {
    assertFound, Channel,
    CustomFieldRelationService,
    ListQueryBuilder,
    ListQueryOptions,
    Logger,
    patchEntity,
    RelationPaths,
    RequestContext,
    TransactionalConnection
} from '@vendure/core';
import {loggerCtx, PERFORMANCE_PLUGIN_OPTIONS} from '../constants';
import {BlogPost} from '../entities/blog-post.entity';
import {PluginInitOptions} from '../types';
import {CreateBlogPostInput, UpdateBlogPostInput} from "../gql/generated";
import {Author} from "../entities/author.entity";

@Injectable()
export class BlogPostService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private customFieldRelationService: CustomFieldRelationService, @Inject(PERFORMANCE_PLUGIN_OPTIONS) private options: PluginInitOptions
    ) {}

    findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<BlogPost>,
        relations?: RelationPaths<BlogPost>,
    ): Promise<PaginatedList<BlogPost>> {
        Logger.verbose('SERVICE: findAll', loggerCtx);
        return this.listQueryBuilder
            .build(BlogPost, options, {
                relations,
                ctx,
            }
            ).getManyAndCount().then(([items, totalItems]) => {
                return {
                    items,
                    totalItems,
                }
            }
            );
    }

    findOne(
        ctx: RequestContext,
        id: ID,
        relations?: RelationPaths<BlogPost>,
    ): Promise<BlogPost | null> {
        return this.connection
            .getRepository(ctx, BlogPost)
            .findOne({
                where: { id },
                relations,
            });
    }

    async create(ctx: RequestContext, input: CreateBlogPostInput): Promise<BlogPost> {
        const newEntity = await this.connection.getRepository(ctx, BlogPost).save(input);
        await this.customFieldRelationService.updateRelations(ctx, BlogPost, input, newEntity);
        if (input.authorId) {
            newEntity.author = await this.connection.getEntityOrThrow(ctx, Author, input.authorId);
            await this.connection.getRepository(ctx, BlogPost).save(newEntity);
        }
        return assertFound(this.findOne(ctx, newEntity.id));
    }

    async update(ctx: RequestContext, input: UpdateBlogPostInput): Promise<BlogPost> {
        const entity = await this.connection.getEntityOrThrow(ctx, BlogPost, input.id);
        const updatedEntity = patchEntity(entity, input);
        await this.connection.getRepository(ctx, BlogPost).save(updatedEntity, { reload: false });
        await this.customFieldRelationService.updateRelations(ctx, BlogPost, input, updatedEntity);
        if (input.authorId) {
            updatedEntity.author = await this.connection.getEntityOrThrow(ctx, Author, input.authorId);
            await this.connection.getRepository(ctx, BlogPost).save(updatedEntity);
        }
        return assertFound(this.findOne(ctx, updatedEntity.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const entity = await this.connection.getEntityOrThrow(ctx, BlogPost, id);
        try {
            await this.connection.getRepository(ctx, BlogPost).remove(entity);
            return {
                result: DeletionResult.DELETED,
            };
        } catch (e: any) {
            return {
                result: DeletionResult.NOT_DELETED,
                message: e.toString(),
            };
        }
    }

    async getContent(ctx: RequestContext, id: ID): Promise<string> {
        const post = await this.connection.getEntityOrThrow(ctx, BlogPost, id);

        // Imagine we need to get all channel data in order to
        // select the correct content
        const channels = await this.connection.getRepository(ctx, Channel).find().then(
            async (channels) => {
                // let's slow things down just to make the point
                await new Promise(resolve => setTimeout(resolve, 1000));
                return channels;
            }
        );

        return post.content
    }
}
