import { z } from "zod";
import { guestDataSchema } from "./lib/guestDataSchema"; // Assuming this exports the schema
import { misDatosSchema } from "./lib/mi-cuenta/misDatosSchema";
import { carritoRegisterSchema } from "./lib/carritoRegisterSchema";

const testCases = [
    { type: 'DNI', valid: '12345678', invalid: ['123', '123456789', 'abcdefgh', '1234567a'] },
    { type: 'RUC', valid: '10123456789', invalid: ['2012345678', '11123456789', 'abcde', '101234567a9'] }, // Starts with 10, 15, 20
    { type: 'CE', valid: '123456789', invalid: ['12345678', '1234567890123', 'abcdefghi'] }, // 9-12 digits
    { type: 'Pasaporte', valid: 'P1234567', invalid: ['12345678', 'AB123456', 'P123456', 'P12345678', ' P1234567', 'P1234567 '] } // 1 letter + 7 digits, no spaces
];

async function runTests() {
    console.log("Starting Document Validation Tests...");
    let failed = false;

    // Helper to create a base valid object
    const createBaseObject = (type: string, doc: string) => ({
        nombre: "Test",
        apellido: "User",
        tipoDocumento: type,
        numeroDocumento: doc,
        celular: "987654321",
        email: "test@example.com",
        departamento: "Dept",
        provincia: "Prov",
        distrito: "Dist",
        direccion: "Address 123",
        numeroDpto: "101",
        referencia: "Ref",
        // carrito specific
        password: "Password123",
        confirmarPassword: "Password123",
        aceptoTerminos: true
    });

    for (const test of testCases) {
        console.log(`Testing ${test.type}...`);

        // Test Valid
        const validObj = createBaseObject(test.type, test.valid);
        const resultValid = guestDataSchema.safeParse(validObj);
        if (!resultValid.success) {
            console.error(`[FAIL] Valid ${test.type} (${test.valid}) failed validation:`, resultValid.error.issues[0]?.message);
            failed = true;
        } else {
            console.log(`[PASS] Valid ${test.type} passed.`);
        }

        // Test Invalid
        for (const inv of test.invalid) {
            const invalidObj = createBaseObject(test.type, inv);
            const resultInvalid = guestDataSchema.safeParse(invalidObj);
            if (resultInvalid.success) {
                console.error(`[FAIL] Invalid ${test.type} (${inv}) passed validation unexpectedly.`);
                failed = true;
            } else {
                const msg = resultInvalid.error.issues.find(e => e.path.includes("numeroDocumento"))?.message;
                console.log(`[PASS] Invalid ${test.type} (${inv}) failed as expected. Message: "${msg}"`);
            }
        }
    }

    if (failed) {
        console.error("Some tests failed.");
        process.exit(1);
    } else {
        console.log("All tests passed successfully!");
    }
}

runTests();
