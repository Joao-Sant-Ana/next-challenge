import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Email não pode estar vázio' })
    @IsEmail({}, { message: 'Email inválido' })
    email!: string;

    @IsNotEmpty({ message: 'Senha não pode estar vazio' })
    password!: string;
}
