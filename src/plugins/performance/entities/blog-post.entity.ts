import {
    DeepPartial,
    HasCustomFields,
    VendureEntity
} from '@vendure/core';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Author} from "./author.entity";

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

    @ManyToOne(type => Author)
    author: Author;

    @Column(type => BlogPostCustomFields)
    customFields: BlogPostCustomFields;
}
