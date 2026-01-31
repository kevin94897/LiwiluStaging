
import { guestDataSchema } from './lib/guestDataSchema';
import { carritoRegisterSchema } from './lib/carritoRegisterSchema';
import { loginSchema } from './lib/loginSchema';

const runTests = () => {
    let passed = 0;
    let failed = 0;

    const test = (name: string, schema: any, data: any, shouldPass: boolean) => {
        const result = schema.safeParse(data);
        if (result.success === shouldPass) {
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } else {
            console.log(`❌ [FAIL] ${name}`);
            if (!result.success) {
                // @ts-ignore
                console.log('   Errors:', result.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '));
            } else {
                console.log('   Expected failure but got success');
            }
            failed++;
        }
    };

    // Helper to generate base valid object
    const validGuest = {
        nombre: 'Juan',
        apellido: 'Perez',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        celular: '987654321',
        email: 'juan@example.com',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Miraflores',
        direccion: 'Calle Falsa 123',
        numeroDpto: '101',
        referencia: 'Frente al parque'
    };

    const validRegister = {
        ...validGuest,
        password: 'password123',
        confirmarPassword: 'password123',
        aceptoTerminos: true
    };

    const validLogin = {
        email: 'juan@example.com',
        password: 'password123'
    };

    console.log('--- Testing Guest Schema ---');
    test('Guest: Valid Phone', guestDataSchema, { ...validGuest, celular: '987654321' }, true);
    test('Guest: Invalid Phone (Letters)', guestDataSchema, { ...validGuest, celular: '9876abc21' }, false);
    test('Guest: Valid Email', guestDataSchema, { ...validGuest, email: 'user@test.com' }, true);
    test('Guest: Invalid Email (Special)', guestDataSchema, { ...validGuest, email: 'user+tag@test.com' }, false);

    console.log('\n--- Testing Register Schema ---');
    test('Register: Valid Data', carritoRegisterSchema, validRegister, true);
    test('Register: Invalid Phone (Letters)', carritoRegisterSchema, { ...validRegister, celular: '987abc321' }, false);
    test('Register: Invalid Email (Special)', carritoRegisterSchema, { ...validRegister, email: 'user+tag@test.com' }, false);

    console.log('\n--- Testing Login Schema ---');
    test('Login: Valid Email', loginSchema, validLogin, true);
    test('Login: Invalid Email (Special)', loginSchema, { ...validLogin, email: 'user+tag@test.com' }, false);

    console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
};

runTests();
