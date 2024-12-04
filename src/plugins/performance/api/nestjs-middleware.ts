import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';

@Injectable()
export class MyNestMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {
        console.log(`MIDDLEWARE: MyNestMiddleware.use`);
        next();
    }
}