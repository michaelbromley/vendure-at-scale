import gql from 'graphql-tag';

const commonApiExtensions = gql`
    type BlogPost implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        code: String!
    }

    type BlogPostList implements PaginatedList {
        items: [BlogPost!]!
        totalItems: Int!
    }

    # Generated at run-time by Vendure
    input BlogPostListOptions

    extend type Query {
        blogPost(id: ID!): BlogPost
        blogPosts(options: BlogPostListOptions): BlogPostList!
    }
`;

const blogPostAdminApiExtensions = gql`
    ${commonApiExtensions}

    input CreateBlogPostInput {
        code: String!
    }

    input UpdateBlogPostInput {
        id: ID!
        code: String
    }

    extend type Mutation {
        createBlogPost(input: CreateBlogPostInput!): BlogPost!
        updateBlogPost(input: UpdateBlogPostInput!): BlogPost!
        deleteBlogPost(id: ID!): DeletionResponse!
    }
`;
export const adminApiExtensions = gql`
    ${blogPostAdminApiExtensions}
`;
export const shopApiExtensions = gql`
    ${commonApiExtensions}
`;