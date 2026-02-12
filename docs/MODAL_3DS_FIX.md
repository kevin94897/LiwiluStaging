# Debug Técnico – Modal 3DS Culqi queda en blanco después del OTP

## Problema

Durante el flujo de autenticación 3DS (Culqi + Cybersource + Cardinal):

1. Se genera correctamente el token.
2. Se ejecuta `pci_cybersource_enrollment`.
3. Se abre el modal 3DS.
4. Se ingresa el OTP de prueba `1234`.
5. El modal queda en blanco.
6. No se ejecuta el callback `window.culqi3DS`.
7. No se realiza la segunda llamada al endpoint `/pay`.

---

## Evidencia en Consola

Se detecta el siguiente mensaje:

PostMessageUtility - received non whitelisted postMessage
Rejected message from untrusted origin:
https://centinelapistag.cardinalcommerce.com

yaml
Copy code

Esto indica que el mensaje `postMessage` enviado por Cardinal (ACS) está siendo rechazado.

---

## Diagnóstico Técnico

3DS 2.0 utiliza `window.postMessage()` para enviar el resultado del challenge
desde el iframe del banco hacia la ventana principal.

Si ese mensaje es bloqueado:

- `window.culqi3DS` nunca se ejecuta.
- No se reciben los parámetros (eci, cavv, xid, protocolVersion, directoryServerTransactionId).
- No se ejecuta el segundo `/pay`.
- El modal queda en blanco.

---

## Causa Probable

El navegador o la aplicación está bloqueando el origen del mensaje.

Dominios involucrados en entorno sandbox:

https://0merchantacsstag.cardinalcommerce.com
https://centinelapistag.cardinalcommerce.com
https://cas.client.cardinaltrusted.com

yaml
Copy code

Si existe:

- Validación manual de `event.origin`
- Política CSP restrictiva
- Configuración incorrecta de frame-src / connect-src

El mensaje será rechazado.

---

## Prueba de Diagnóstico

Agregar temporalmente este listener global:

```js
window.addEventListener("message", (event) => {
  console.log("3DS MESSAGE RECEIVED:");
  console.log("Origin:", event.origin);
  console.log("Data:", event.data);
});
Repetir el flujo 3DS.

Resultado esperado
Debe aparecer un mensaje proveniente de:

markdown
Copy code
*.cardinalcommerce.com
*.cardinaltrusted.com
Si aparece pero no ejecuta window.culqi3DS,
entonces el problema está en la validación manual del origen.

Si no aparece ningún mensaje,
el problema es CSP o bloqueo de iframe.

Verificar si existe validación manual de origen
Buscar en el proyecto:

js
Copy code
window.addEventListener("message", (event) => {
  if (event.origin !== "https://tu-dominio.com") return;
});
Este tipo de validación bloquea el mensaje del ACS.

Verificar CSP (Content Security Policy)
Revisar headers o configuración en Next.js:

Debe permitir:

perl
Copy code
frame-src https://*.cardinalcommerce.com https://*.cardinaltrusted.com;
child-src https://*.cardinalcommerce.com https://*.cardinaltrusted.com;
connect-src https://*.cardinalcommerce.com https://*.cardinaltrusted.com;
Si no están incluidos, el navegador bloqueará el flujo 3DS.

Verificar implementación de Culqi 3DS
Debe existir:

js
Copy code
window.culqi3DS = function(response) {
  console.log("3DS Success Response:", response);
};
Si esta función no se ejecuta,
el postMessage está siendo bloqueado.

Flujo Correcto Esperado
Enrollment → PENDING_AUTHENTICATION

Se abre StepUp

Usuario ingresa OTP

ACS envía postMessage

Se ejecuta window.culqi3DS

Frontend llama nuevamente a /pay con:

json
Copy code
{
  token,
  authentication3DS: {
    eci,
    xid,
    cavv,
    protocolVersion,
    directoryServerTransactionId
  }
}
Backend procesa el charge final.

Se confirma pago.

Conclusión
El problema no está en:

Token

Enrollment

OTP

Backend inicial

El problema está en el bloqueo del postMessage
proveniente de Cardinal (ACS).

Se debe revisar:

CSP

Validaciones manuales de origin

Configuración del SDK 3DS
```
