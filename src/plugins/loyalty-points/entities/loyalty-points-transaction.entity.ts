import {
    Customer,
    DeepPartial, Order,
    VendureEntity
} from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';


@Entity()
export class LoyaltyPointsTransaction extends VendureEntity {
    constructor(input?: DeepPartial<LoyaltyPointsTransaction>) {
        super(input);
    }

    @Column()
    code: string;

    @ManyToOne((type) => Customer)
    customer: Customer;

    @Column('varchar')
    type: string;

    @Column()
    note: string;

    @Column()
    value: number;

    @ManyToOne((type) => Order)
    order?: Order;
}
