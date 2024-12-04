import {
    DeepPartial,
    HasCustomFields,
    VendureEntity
} from '@vendure/core';
import { Column, Entity } from 'typeorm';

export class BlogPostCustomFields {}

@Entity()
export class BlogPost extends VendureEntity implements HasCustomFields {
    constructor(input?: DeepPartial<BlogPost>) {
        super(input);
    }

    @Column()
    slug: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column(type => BlogPostCustomFields)
    customFields: BlogPostCustomFields;
}
