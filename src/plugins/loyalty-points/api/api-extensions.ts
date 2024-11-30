import gql from 'graphql-tag';

export const commonApiExtensions = gql`
    enum LoyaltyTransactionType {
        USED_ON_ORDER
        EARNED_ON_ORDER
        ORDER_CANCELLED
        ADMINISTRATOR_ADJUSTED
        OTHER
    }

    type LoyaltyPointsTransaction implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        type: LoyaltyTransactionType!
        note: String!
        value: Int!
        order: Order
    }

    type LoyaltyPointsTransactionList implements PaginatedList {
        items: [LoyaltyPointsTransaction!]!
        totalItems: Int!
    }

    extend type Customer {
        loyaltyPointsTransactions(options: LoyaltyPointsTransactionListOptions): LoyaltyPointsTransactionList!
    }

    # Auto-generated at runtime
    input LoyaltyPointsTransactionListOptions
`;

export const adminApiExtensions = gql`
    ${commonApiExtensions}

    input LoyaltyPointsTransactionInput {
        customerId: ID!
        note: String!
        value: Int!
    }

    extend type Mutation {
        createLoyaltyPointsTransaction(input: LoyaltyPointsTransactionInput!): LoyaltyPointsTransaction!
    }
`;

export const shopApiExtensions = gql`
    ${commonApiExtensions}

    extend type Mutation {
        applyLoyaltyPointsToActiveOrder(amount: Int!): Order!
    }

    extend type Order {
        loyaltyPointsEarned: Int!
    }
`;
