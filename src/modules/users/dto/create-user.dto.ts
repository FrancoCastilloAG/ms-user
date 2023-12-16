export class CreateUserDto {
  constructor(  nombre:string,
    email:string,
    password:string,
    verificationCode:string,) {
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.verificationCode= verificationCode;
}
  nombre:string;
  email:string;
  password:string;
  verificationCode:string;
}