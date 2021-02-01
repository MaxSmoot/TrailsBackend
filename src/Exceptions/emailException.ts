import CreateError from "../utils/createError";

export class EmailNotValidException extends CreateError {
    constructor(){
        super("Email is not valid", 422, true);
    }
}