import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    config: {
        // This tells codegen that the `Money` scalar is a number
        scalars: {Money: 'number'},
        // This ensures generated enums do not conflict with the built-in types.
        namingConvention: {enumValues: 'keep'},
        maybeValue: 'T | undefined',
    },
    generates: {
        './src/plugins/loyalty-points/gql/generated.ts': {
            schema: 'http://localhost:3000/admin-api',
            plugins: ['typescript']
        },
        './src/plugins/referral/gql/generated.ts': {
            schema: 'http://localhost:3000/admin-api',
            plugins: ['typescript']
        },
        './src/plugins/referral/gql/generated-shop.ts': {
            schema: 'http://localhost:3000/shop-api',
            plugins: ['typescript'],
        },
        './src/plugins/performance/gql/generated.ts': {
            schema: 'http://localhost:3000/admin-api',
            plugins: ['typescript'],
        },
        './src/plugins/performance/gql/generated-shop.ts': {
            schema: 'http://localhost:3000/shop-api',
            plugins: ['typescript'],
        },
    },
};

export default config;
