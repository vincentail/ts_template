import { Controller, Get, Inject } from '@nestjs/common'
import moment from 'moment'
import BaseResponse from '../../libs/api/response/baseResponse'
import ErrorCode from '../../libs/api/response/errorCode'
import Validator from '../../libs/api/validator'

@Controller('/test')
export class TestController {
    constructor(
    ) {}

    @Get('/currentTime')
    async currentTime(): Promise<any> {
        return moment().utc().format("yyyy-MM-DD")
    }
}
