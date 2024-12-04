import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import {Logger} from "@vendure/core";
import {loggerCtx} from "../constants";

@Injectable()
export class MyNestMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {
        Logger.debug(`MIDDLEWARE: MyNestMiddleware.use`, loggerCtx);
        next();
    }
}