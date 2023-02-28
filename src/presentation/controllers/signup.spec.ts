import { SignUpController } from './signup'

describe('SignUp Controller', () => { // colocar o nome do componente que está testando
    test('Should return 400 if no name is provided', () => {
        const sut = new SignUpController() // primeiro instanciar a classe de teste
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
    })
})