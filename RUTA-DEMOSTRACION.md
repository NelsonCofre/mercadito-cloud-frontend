# Ruta de demostración en la nube

Sitio: https://ur4fza3gqi.execute-api.us-east-1.amazonaws.com

Región: `us-east-1`. El laboratorio tiene que estar abierto. Sigue los pasos en este orden.

## 1. API Gateway creado y en funcionamiento

1. En la consola abre API Gateway.
2. Entra a las API HTTP y abre `mercadito-api` (id `ur4fza3gqi`).
3. Muestra que la API existe y que su URL de invocación es la del sitio.
4. Abre esa URL en el navegador.

Resultado esperado: carga Mercadito Cloud. La página la entrega S3 a través del API Gateway.

## 2. Configuración que llama al backend

En la misma API, abre Rutas e Integraciones.

| Ruta | Destino |
| --- | --- |
| `ANY /api/{proxy+}` | `http://44.197.90.172:8080/api/{proxy}` (BFF) |
| `ANY /{proxy+}` | sitio web del bucket S3 `mercadito-frontend-764066955985` |

`44.197.90.172` es la IP elástica de la EC2 `mercadito-bff`.

En Autorizadores, muestra el autorizador JWT de Cognito asociado a `/api`. El emisor es `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_k6i5fiOXd` y la audiencia es el cliente `54029vs6af51eq3psh8pgn9vs0`.

## 3. El frontend consume los endpoints por el API Gateway

1. Entra al sitio e inicia sesión como cliente con `nico.sanchezh@duocuc.cl`.
2. Abre el catálogo.
3. En las herramientas del navegador, pestaña Red, filtra por `catalogo`.

Resultado esperado: la petición va a `https://ur4fza3gqi.execute-api.us-east-1.amazonaws.com/api/catalogo/productos` y responde `200`. No aparece la IP de la EC2. El build publicado usa esa URL del API Gateway.

## 4. El API Gateway valida el JWT

### Rechaza una petición inválida

1. Abre una pestaña nueva.
2. Pega `https://ur4fza3gqi.execute-api.us-east-1.amazonaws.com/api/catalogo/productos`.

Resultado esperado: estado `401` y `{"message":"Unauthorized"}`. Ese texto lo escribe el API Gateway. No llega al BFF. El BFF, si recibiera la llamada sin token, diría `Debes iniciar sesión`.

Un token inventado también recibe `401`. El encabezado `www-authenticate` indica `invalid_token`.

### Acepta una petición correcta

Con la sesión del cliente todavía abierta, el catálogo del paso 3 responde `200`. El API Gateway dejó pasar el JWT y el BFF devolvió los productos.

La prueba del rol está en `PRUEBAS-EXCEPCIONES.md`: un cliente con token válido que pide `/api/admin/categorias` pasa el API Gateway y el BFF responde `403`.

## 5. User Pool y usuarios registrados

1. En la consola abre Cognito.
2. Entra al grupo de usuarios `us-east-1_k6i5fiOXd`.
3. Abre Usuarios.

Resultado esperado: aparecen al menos estos usuarios registrados:

- `nel.cofre@duocuc.cl`, grupo `ADMIN`
- `nico.sanchezh@duocuc.cl`, grupo `CLIENTE`

El dominio del inicio de sesión es `us-east-1k6i5fioxd.auth.us-east-1.amazoncognito.com`.

## 6. El frontend inicia sesión con OAuth 2.0 y OpenID Connect

1. En el sitio pulsa Iniciar sesión.
2. Mira la barra de direcciones antes de escribir la contraseña.

La dirección es `https://us-east-1k6i5fioxd.auth.us-east-1.amazoncognito.com/oauth2/authorize` y lleva:

- `response_type=code`
- `scope=openid email profile`
- `code_challenge_method=S256`

Eso es el flujo de código de autorización con PKCE. OpenID Connect entra por el scope `openid`.

3. Completa el acceso.
4. El navegador vuelve a `/callback`.
5. En la pestaña Red aparece `POST` a `/oauth2/token`.
6. En Almacenamiento de sesión, la clave `mercadito-sesion` guarda el `id_token`.

Ese `id_token` es el JWT que el frontend envía como `Authorization: Bearer` en cada llamada al API Gateway.

## 7. Backend y frontend desplegados, activos e integrados

En EC2, las tres instancias en ejecución:

| Nombre | Rol |
| --- | --- |
| `mercadito-bff` | BFF, IP elástica `44.197.90.172` |
| `mercadito-productos` | productos-service |
| `mercadito-carrito` | carrito-service |

En S3, el bucket `mercadito-frontend-764066955985` tiene el sitio estático.

La integración se ve porque la misma URL del API Gateway entrega las páginas y las llamadas `/api`. El navegador no habla con las EC2. El detalle de cada pieza está en `DOCUMENTACION.md`.
