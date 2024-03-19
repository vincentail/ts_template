import { Module } from '@nestjs/common'
import {TestController} from "./test.controller";

@Module({
    imports: [],
    providers: [],
    exports: [],
    controllers: [TestController],
})
export class TestModule {}
