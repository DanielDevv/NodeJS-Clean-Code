import { SignUpController } from './signup'
import { MissingParamError } from '../errors/missing-param-error'
import { InvalidParamError } from '../errors/invalid-param-error'
import { ServerError } from '../errors/server-error'
import { EmailValidator } from '../protocols/email-validator'

interface SutTypes {
    sut: SignUpController,
    emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
    class EmailValidatorStub implements EmailValidator { // dublê de teste, é um tipo de mock, no stub damos um retorno chumbado
        isValid(email: string): boolean {
            return true 
        }
    }
    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)
    return {
        sut,
        emailValidatorStub
    }
}

describe('SignUp Controller', () => { // colocar o nome do componente que está testando
    test('Should return 400 if no name is provided', () => {
        const { sut } = makeSut() // primeiro instanciar a classe de teste
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('name'))
    })

    test('Should return 400 if no email is provided', () => {
        const { sut } = makeSut() // primeiro instanciar a classe de teste
        const httpRequest = {
            body: {
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return 400 if no password is provided', () => {
        const { sut } = makeSut() // primeiro instanciar a classe de teste
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@mail.com',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })

    test('Should return 400 if no password confirmation is provided', () => {
        const { sut } = makeSut() // primeiro instanciar a classe de teste
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@mail.com',
                password: 'any_password',
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
    })

    test('Should return 400 if an invalid email is provided', () => {
        const { sut, emailValidatorStub } = makeSut() // primeiro instanciar a classe de teste
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false) // espionando o método isValid
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'invalid_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        } 
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    })

    test('Should call EmailValidator with correct email', () => {
        const { sut, emailValidatorStub } = makeSut() // primeiro instanciar a classe de teste
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid') // espionando o método isValid

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        } 
        sut.handle(httpRequest) 
        expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
    })

    test('Should return 500 if EmailValidator throws', () => {
        class EmailValidatorStub implements EmailValidator { // dublê de teste, é um tipo de mock, no stub damos um retorno chumbado
        isValid(email: string): boolean {
            throw new Error()
        }
    }
    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        } 
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
})