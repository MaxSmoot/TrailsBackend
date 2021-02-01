import validator from "email-validator";
import { EmailNotValidException } from "../Exceptions/emailException";
export class Email {
  public readonly value: string;
  constructor(email: string) {
    if (validator.validate(email)) {
      this.value = email;
    } else {
      throw new EmailNotValidException();
    }
  }
}
