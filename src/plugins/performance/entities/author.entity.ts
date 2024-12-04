import {
    Asset,
    DeepPartial,
    HasCustomFields,
    VendureEntity
} from '@vendure/core';
import {Column, Entity, ManyToOne} from 'typeorm';


export class AuthorCustomFields {}

@Entity()
export class Author extends VendureEntity implements HasCustomFields {
    constructor(input?: DeepPartial<Author>) {
        super(input);
    }

    @Column()
    name: string;

    @ManyToOne(type => Asset)
    avatar: Asset;

    @Column(type => AuthorCustomFields)
    customFields: AuthorCustomFields;
}
