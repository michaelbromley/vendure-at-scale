import { IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Customer, RequestContext, TransactionalConnection } from '@vendure/core';

@Injectable()
export class ReferralCodeService {
    constructor(private connection: TransactionalConnection) {}

    async getCustomerFromReferralCode(ctx: RequestContext, code: string): Promise<Customer | null> {
        return this.connection.getRepository(ctx, Customer).findOne({
            where: {
                customFields: {
                    referralCode: code,
                },
                deletedAt: IsNull(),
            },
        });
    }

    async generateReferralCode(ctx: RequestContext): Promise<string> {
        let code: string;
        do {
            code = this.generateCandidate();
        } while (await this.codeAlreadyUsed(ctx, code));
        return code;
    }

    /**
     * Generate a 5-character random code
     */
    private generateCandidate(): string {
        const chars = '23456789BCDFGHJKLMNPQRSTVWXYZ';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    private async codeAlreadyUsed(ctx: RequestContext, code: string): Promise<boolean> {
        const result = await this.connection.getRepository(ctx, Customer).findOne({
            where: {
                customFields: {
                    referralCode: code,
                },
            },
        });
        return result != null;
    }
}
