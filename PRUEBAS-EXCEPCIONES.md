# Pruebas de las 3 excepciones

Sitio: https://ur4fza3gqi.execute-api.us-east-1.amazonaws.com

Antes de la prueba 2 y la 3, entra de nuevo para que el token siga vigente. El token dura una hora. Si está vencido, API Gateway responde 401 y no se llega a ver el 403 ni el 409.

Cada excepción falla en un punto distinto.

## 1. Sin token: 401

API Gateway rechaza la petición. No llega al BFF.

1. Abre una pestaña nueva.
2. Pega esta dirección:

   https://ur4fza3gqi.execute-api.us-east-1.amazonaws.com/api/catalogo/productos

3. El navegador no envía el token al pegar la URL.

Resultado esperado: estado `401` y este texto:

```json
{"message":"Unauthorized"}
```

## 2. Token válido sin el rol: 403

El token sirve, pero el cliente no puede administrar. API Gateway deja pasar la llamada y el BFF responde que no hay permiso.

1. Entra como cliente con `nico.sanchezh@duocuc.cl`.
2. Abre las herramientas del navegador y ve a la pestaña Consola.
3. Pega esto y presiona Enter:

```javascript
const sesion = JSON.parse(sessionStorage.getItem('mercadito-sesion'));
const respuesta = await fetch('/api/admin/categorias', {
  headers: { Authorization: 'Bearer ' + sesion.token }
});
console.log(respuesta.status, await respuesta.json());
```

Resultado esperado: estado `403` y el mensaje `No tienes permiso para esta acción`.

Qué decir: un cliente con la sesión vigente pide las categorías. El token es válido, pero ese rol no puede administrar, así que el BFF responde 403.

## 3. Regla de negocio: 409

El administrador sí tiene permiso. productos-service rechaza borrar una categoría que todavía tiene productos.

1. Sal de la sesión del cliente.
2. Entra como administrador con `nel.cofre@duocuc.cl`.
3. Abre Categorías.
4. Pulsa Eliminar en Abarrotes, Lácteos o Bebidas.
5. Confirma.

Resultado esperado: la pantalla muestra `No se puede eliminar la categoría porque tiene productos asociados`. En la pestaña Red, esa petición aparece con estado `409`.

La categoría no se borra.
