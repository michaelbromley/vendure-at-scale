import {Inject, Injectable} from '@nestjs/common';
import {DeletionResponse, DeletionResult} from '@vendure/common/lib/generated-types';
import {ID, PaginatedList} from '@vendure/common/lib/shared-types';
import {
    assertFound,
    Asset,
    CustomFieldRelationService,
    ListQueryBuilder,
    ListQueryOptions,
    patchEntity,
    RelationPaths,
    RequestContext,
    TransactionalConnection
} from '@vendure/core';
import {PERFORMANCE_PLUGIN_OPTIONS} from '../constants';
import {Author} from '../entities/author.entity';
import {PluginInitOptions} from '../types';
import {CreateAuthorInput, UpdateAuthorInput} from "../gql/generated";

@Injectable()
export class AuthorService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private customFieldRelationService: CustomFieldRelationService, @Inject(PERFORMANCE_PLUGIN_OPTIONS) private options: PluginInitOptions
    ) {}

    findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<Author>,
        relations?: RelationPaths<Author>,
    ): Promise<PaginatedList<Author>> {
        return this.listQueryBuilder
            .build(Author, options, {
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
        relations?: RelationPaths<Author>,
    ): Promise<Author | null> {
        return this.connection
            .getRepository(ctx, Author)
            .findOne({
                where: { id },
                relations,
            });
    }

    async create(ctx: RequestContext, input: CreateAuthorInput): Promise<Author> {
        const newEntity = await this.connection.getRepository(ctx, Author).save(input);
        if (input.avatarId) {
            newEntity.avatar = await this.connection.getEntityOrThrow(ctx, Asset, input.avatarId);
            await this.connection.getRepository(ctx, Author).save(newEntity);
        }
        await this.customFieldRelationService.updateRelations(ctx, Author, input, newEntity);
        return assertFound(this.findOne(ctx, newEntity.id));
    }

    async update(ctx: RequestContext, input: UpdateAuthorInput): Promise<Author> {
        const entity = await this.connection.getEntityOrThrow(ctx, Author, input.id);
        const updatedEntity = patchEntity(entity, input);
        if (input.avatarId) {
            updatedEntity.avatar = await this.connection.getEntityOrThrow(ctx, Asset, input.avatarId);
        }
        await this.connection.getRepository(ctx, Author).save(updatedEntity, { reload: false });
        await this.customFieldRelationService.updateRelations(ctx, Author, input, updatedEntity);
        return assertFound(this.findOne(ctx, updatedEntity.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const entity = await this.connection.getEntityOrThrow(ctx, Author, id);
        try {
            await this.connection.getRepository(ctx, Author).remove(entity);
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
}
