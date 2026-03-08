const schemas = [
  { name: "guestDataSchema.ts", regex: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,.-]+$/ },
  { name: "carritoRegisterSchema.ts", regex: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,.-]+$/ },
  { name: "trimegistoRegisterSchema.ts", regex: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,.-]+$/ },
  { name: "misDatosSchema.ts", regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.-]+$/ },
  { name: "registerSchema.ts", regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ,.-]+$/ },
  { name: "autorizacionSchema.ts", regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.-]+$/ },
];

const testCases = [
  "Empresa S.A.C.",
  "Jean-Pierre",
  "Gomez, Kevin",
  "O'Connor", // Should fail based on requirements (not requested)
  "123", // Should fail
  "Razón Social LTDA.",
  "Nombre-Apellido",
];

console.log("Testing Name/Surname regexes:\n");

schemas.forEach(schema => {
  console.log(`Schema: ${schema.name}`);
  testCases.forEach(testCase => {
    const passed = schema.regex.test(testCase);
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] "${testCase}"`);
  });
  console.log('\n');
});
