import CreateError from "../utils/createError";

export class PasswordException extends CreateError{
    constructor(){
        super("Invalid Password", 422, true);
    }
}