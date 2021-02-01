import bcrypt from "bcrypt";
import { PasswordException } from "../Exceptions/passwordException";
export class Password {
  public readonly value: string;
  constructor(hashedPassword: string) {
    this.value = hashedPassword;
  }
  public getHash() {
    return this.value;
  }
  public static async of(password: string) {
    if (Password.isValidPassword(password)) {
      return await Password.create(password);
    }else{
        throw new PasswordException();
    }
  }
  public static isValidPassword(password: string) {
    return password.length > 8 && password.length < 256;
  }
  private static async create(password: String) {
    const hash = await bcrypt.hash(password, 10);
    return new Password(hash);
  }
}
