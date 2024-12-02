import { Customer, DeepPartial, Order, VendureEntity } from '@vendure/core';
import { Column, Index, Entity, ManyToOne } from 'typeorm';

import { ReferralState } from '../gql/generated';

@Entity()
@Index(['customer', 'referredBy'], { unique: true })
export class Referral extends VendureEntity {
    constructor(input: DeepPartial<Referral>) {
        super(input);
    }

    @ManyToOne((type) => Customer)
    customer: Customer;

    @ManyToOne((type) => Order)
    order: Order;

    @ManyToOne((type) => Customer)
    referredBy: Customer;

    @Column('varchar')
    state: ReferralState;

    @Column()
    rewardGranted: boolean;

    @Column({ default: 0 })
    rewardPointsEarned: number;

    @Column({ nullable: true })
    privateNote: string;

    @Column({ nullable: true })
    publicNote: string;
}
