import emailValidator from "email-validator"
import { Email } from "../common/email";
import { Password } from "../common/password";
export class User{
    username: string;
    email: Email;
    password: Password;
    phone: string;
    firstName: string;
    lastName: string;

    constructor(username: string, email: Email, password: Password, phone: string, firstName: string, lastName: string){
        this.username = username;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.firstName = firstName;
        this.lastName = lastName;
    }

}