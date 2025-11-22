import { IsNotEmpty, IsEmail } from 'class-validator';

export class SigninDto {
    @IsNotEmpty({ message: 'Email não pode estar vazio' })
    @IsEmail({}, { message: 'Email inválido' })
    email!: string;

    @IsNotEmpty({ message: 'Senha não pode estar vazia' })
    password!: string;
}
