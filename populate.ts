import path from "path";
import {populate} from "@vendure/core/cli";
import {bootstrap, RequestContextService} from "@vendure/core";
import {config} from "./src/vendure-config";
import {clearAllTables} from "@vendure/testing";
import {BlogPostService} from "./src/plugins/performance/services/blog-post.service";
import {AuthorService} from "./src/plugins/performance/services/author.service";

clearAllTables({ ...config, plugins: [] })
    .then(() => {
        console.log(`Cleared all tables`);
        return populate(
            () => bootstrap({
                ...config,
                logger: undefined,
                importExportOptions: {
                    importAssetsDir: path.join(
                        require.resolve('@vendure/create/assets/products.csv'),
                        '../images'
                    ),
                },
                dbConnectionOptions: {...config.dbConnectionOptions, synchronize: true}
            }),
            require('@vendure/create/assets/initial-data.json'),
            require.resolve('@vendure/create/assets/products.csv')
        )
    })
    .then(async app => {
        console.log('Populated database');
        const blogPostService = app.get(BlogPostService);
        const authorService = app.get(AuthorService);
        const requestContextService = app.get(RequestContextService);
        const ctx = await requestContextService.create({
            apiType: 'admin',
        });

        const author = await authorService.create(ctx, {
            avatarId: '1',
            name: 'Bob Ross',
        });
        for (let i = 0; i < 10; i++) {
            await blogPostService.create(ctx, {
                slug: `blog-post-${i + 1}`,
                title: `Blog post ${i + 1}`,
                content: 'Lorem ipsum dolor sit amet',
                authorId: author.id.toString(),
            });
        }
        console.log(`Populated blog posts`);
        return app.close();
    })