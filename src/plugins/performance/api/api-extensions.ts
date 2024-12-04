import gql from 'graphql-tag';

const commonApiExtensions = gql`
    type Author implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        name: String!
        avatar: Asset
    }

    type BlogPost implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        slug: String!
        title: String!
        content: String!
        author: Author!
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
        slug: String!
        title: String!
        content: String!
        authorId: ID!
    }

    input UpdateBlogPostInput {
        id: ID!
        slug: String
        title: String
        content: String
        authorId: ID
    }

    extend type Mutation {
        createBlogPost(input: CreateBlogPostInput!): BlogPost!
        updateBlogPost(input: UpdateBlogPostInput!): BlogPost!
        deleteBlogPost(id: ID!): DeletionResponse!
    }
`;
const authorAdminApiExtensions = gql`


    type AuthorList implements PaginatedList {
        items: [Author!]!
        totalItems: Int!
    }

    # Generated at run-time by Vendure
    input AuthorListOptions

    extend type Query {
        author(id: ID!): Author
        authors(options: AuthorListOptions): AuthorList!
    }

    input CreateAuthorInput {
        name: String!
        avatarId: ID
    }

    input UpdateAuthorInput {
        id: ID!
        name: String
        avatarId: ID
    }

    extend type Mutation {
        createAuthor(input: CreateAuthorInput!): Author!
        updateAuthor(input: UpdateAuthorInput!): Author!
        deleteAuthor(id: ID!): DeletionResponse!
    }
`;
export const adminApiExtensions = gql`
    ${blogPostAdminApiExtensions}
    ${authorAdminApiExtensions}
`;
export const shopApiExtensions = gql`
    ${commonApiExtensions}
`;