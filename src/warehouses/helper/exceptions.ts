import { HttpException, HttpStatus } from "@nestjs/common";

export class CallException {

    constructor(){}


    message(message){
        throw new HttpException(
            "May be something was wrong !!",
            HttpStatus.BAD_REQUEST,
        );
    }

    
        

}