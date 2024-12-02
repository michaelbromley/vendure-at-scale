import gql from 'graphql-tag';

export const commonApiExtensions = gql`
    enum ReferralState {
        PENDING
        APPROVED
        REJECTED
    }
`;

export const adminApiExtensions = gql`
    ${commonApiExtensions}

    type Referral implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        state: ReferralState!
        customer: Customer!
        order: Order!
        referredBy: Customer!
        rewardGranted: Boolean!
        rewardPointsEarned: Int!
        privateNote: String
        publicNote: String
    }

    type ReferralList implements PaginatedList {
        items: [Referral!]!
        totalItems: Int!
    }

    # generated at run-time
    input ReferralListOptions

    input ReferralFilterParameter {
        referredByLastName: StringOperators
        customerLastName: StringOperators
    }

    extend type Query {
        referrals(options: ReferralListOptions): ReferralList!
        referral(id: ID!): Referral
    }

    input UpdateReferralInput {
        id: ID!
        state: ReferralState
        privateNote: String
        publicNote: String
    }

    extend type Mutation {
        updateReferral(input: UpdateReferralInput!): Referral!
    }
`;

export const shopApiExtensions = gql`
    ${commonApiExtensions}

    type ShopReferral implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        state: ReferralState!
        customerName: String!
        rewardPointsEarned: Int!
        note: String
    }

    type ShopReferralList implements PaginatedList {
        items: [ShopReferral!]!
        totalItems: Int!
    }

    # generated at run-time
    input ShopReferralListOptions

    type SetReferralResult {
        success: Boolean!
        referredByName: String
        errorMessage: String
    }

    extend type Query {
        activeCustomerReferralCode: String
        activeCustomerReferrals(options: ShopReferralListOptions): ShopReferralList!
    }

    extend type Mutation {
        setReferralCode(code: String!): SetReferralResult!
    }
`;
