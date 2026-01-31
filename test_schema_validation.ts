
import { guestDataSchema } from './lib/guestDataSchema';

const runTests = () => {
    let passed = 0;
    let failed = 0;

    const test = (name: string, data: any, shouldPass: boolean) => {
        const result = guestDataSchema.safeParse(data);
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
    const validBase = {
        nombre: 'Juan',
        apellido: 'Perez',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678', // 8 digits for DNI
        celular: '987654321', // 9 digits
        email: 'juan@example.com',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Miraflores',
        direccion: 'Calle Falsa 123',
        numeroDpto: '101',
        referencia: 'Frente al parque'
    };

    console.log('--- Testing Phone Validation ---');
    test('Valid Phone (9 digits)', { ...validBase, celular: '987654321' }, true);
    test('Invalid Phone (Spaces)', { ...validBase, celular: '987 654 321' }, false);
    test('Invalid Phone (Hyphens)', { ...validBase, celular: '987-654-321' }, false);
    test('Invalid Phone (Letters)', { ...validBase, celular: '9876abc21' }, false);
    test('Invalid Phone (Symbols)', { ...validBase, celular: '+51987654321' }, false);

    console.log('--- Testing Optional Phone ---');
    test('Valid Optional Phone (Empty)', { ...validBase, telefonoOpcional: undefined }, true);
    // Note: guestDataSchema optional check depends on how it is defined (string().optional() allows undefined but if string is passed it validates rules if added)
    // Current schema says z.string().optional() with no extra rules, so "abc" might pass before our changes. 
    // We want it to fail if it has non-numbers.
    test('Invalid Optional Phone (Letters)', { ...validBase, telefonoOpcional: 'abc' }, false); 

    console.log('--- Testing Email Validation ---');
    test('Valid Email (Standard)', { ...validBase, email: 'user@example.com' }, true);
    test('Valid Email (Dots)', { ...validBase, email: 'user.last@example.co.uk' }, true);
    test('Valid Email (Underscore)', { ...validBase, email: 'user_last@example.com' }, true);
    test('Valid Email (Hyphen)', { ...validBase, email: 'user-last@example.com' }, true);
    test('Invalid Email (Plus Symbol)', { ...validBase, email: 'user+tag@example.com' }, false); // User asked for NO special symbols "sin símbolos especiales adicionales" besides basic ones
    test('Invalid Email (Parentheses)', { ...validBase, email: 'user(name)@example.com' }, false);

    console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
};

runTests();
