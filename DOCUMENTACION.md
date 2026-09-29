# Mercadito Cloud

Tienda de demostración. El cliente ve el catálogo, arma un carrito y simula un pago. El vendedor edita productos. El administrador crea y elimina productos y categorías. No se guardan pedidos ni pagos reales.

## Cómo se conecta

```text
Navegador
    │
    ▼
Amazon API Gateway (HTTPS, único punto de entrada)
    │
    ├── páginas  →  bucket S3 (frontend estático)
    │
    └── /api/**  →  BFF en EC2
                        │
                        ├── productos-service  →  Aurora, base product_db
                        └── carrito-service    →  Aurora, base cart_db
                                              └── consulta productos por HTTP
```

El frontend no llama a los microservicios ni al BFF por su IP. Solo conoce la URL del API Gateway.

Sitio público: `https://ur4fza3gqi.execute-api.us-east-1.amazonaws.com`

Región: `us-east-1`.

## Frontend

| Pieza | Uso |
| --- | --- |
| React 19 | Interfaz |
| TypeScript | Tipado |
| Vite | Desarrollo y build de producción |
| React Router 7 | Rutas del sitio |
| Amazon Cognito | Login |

El login es OAuth 2.0, flujo de código de autorización con PKCE, contra la pantalla de Cognito. El código está en `src/cognito.ts`. Cada llamada al API lleva `Authorization: Bearer` con el ID token (`src/api.ts`).

Rutas:

- Cliente: `/catalogo`, `/productos/:id`, `/carrito`, `/pago`
- Vendedor: `/vendedor/productos`
- Administrador: `/admin/productos`, `/admin/categorias`

El pago es una simulación en el navegador. No hay servicio de pagos. Al aprobar, el frontend pide vaciar el carrito.

Variables en `.env` (local) y `.env.production` (build que se sube). Esos archivos no van a Git. La plantilla sin secretos es `.env.example`.

## API Gateway

HTTP API `mercadito-api`.

| Ruta | Destino |
| --- | --- |
| `ANY /api/{proxy+}` | `http://44.197.90.172:8080/api/{proxy}` (BFF) |
| `ANY /{proxy+}` | sitio web del bucket S3 |

`44.197.90.172` es la IP elástica del BFF. Si se libera esa IP, hay que actualizar esta integración.

## BFF

Spring Boot 4.1.1, Java 21, puerto 8080. No tiene base de datos. Reenvía las operaciones a productos y a carrito.

Aquí se valida el JWT de Cognito y el rol:

| Ruta | Quién puede |
| --- | --- |
| `GET /api/catalogo/**` | CLIENTE |
| `/api/carrito/**` | CLIENTE |
| Ver y editar productos de administración | VENDEDOR y ADMIN |
| Ver categorías de administración | VENDEDOR y ADMIN |
| El resto de `/api/admin/**` | ADMIN |

Sin token, responde 401: "Debes iniciar sesión". Con token de otro rol, responde 403: "No tienes permiso para esta acción".

El ID token de Cognito dura 1 hora si no se cambia el cliente. Cognito no permite menos de 5 minutos.

Grupo de usuarios: `us-east-1_k6i5fiOXd`. Cliente público de la SPA: `54029vs6af51eq3psh8pgn9vs0`. Dominio: `us-east-1k6i5fioxd.auth.us-east-1.amazoncognito.com`.

## productos-service

Spring Boot 4.1.1, Java 21, puerto 8081. Spring Data JPA e Hibernate (`ddl-auto=update`). Driver PostgreSQL. El listado de productos usa Criteria.

Base `product_db` en Aurora. Si está vacía, crea las categorías Abarrotes, Lácteos y Bebidas y los productos Arroz, Leche y Agua mineral.

## carrito-service

Spring Boot 4.1.1, Java 21, puerto 8082. Misma pila de datos. Base `cart_db`.

No lee `product_db`. Si necesita un producto, llama a productos-service por HTTP.

Estos dos servicios no están abiertos a internet. El grupo de seguridad solo deja entrar al BFF. La comprobación de roles está en el BFF.

## Datos

Un clúster Aurora PostgreSQL 17, provisionado, instancia `db.t3.medium`, sin réplica, sin acceso público. VPC por defecto.

Endpoint de escritura: `mercadito-aurora.cluster-cxsmzlz2qb3k.us-east-1.rds.amazonaws.com`.

Dos bases en ese clúster: `product_db` y `cart_db`. La contraseña vive en el `.env` de cada instancia y no está en Git.

## Dónde corre cada cosa

| Pieza | Dónde |
| --- | --- |
| Páginas | S3, bucket `mercadito-frontend-764066955985`, alojamiento de sitio web estático |
| BFF | EC2 `mercadito-bff`, IP elástica `44.197.90.172`, IP privada `172.31.30.247` |
| productos-service | EC2 `mercadito-productos`, IP privada `172.31.28.236` |
| carrito-service | EC2 `mercadito-carrito`, IP privada `172.31.24.14` |

Amazon Linux 2023, `t3.micro`. Los procesos Java los mantiene systemd (`bff`, `productos`, `carrito`) para que vuelvan al reiniciar la instancia.

Al detener y volver a iniciar, las IP privadas y la IP elástica del BFF se mantienen. La IP pública automática de productos y de carrito cambia y solo sirve para SSH.

## Qué no forma parte del sistema

No hay Docker, CloudFront, nginx, servicio de autenticación propio, servicio de pedidos ni servicio de pagos. No existe la entidad Pedido. El laboratorio no permitió CloudFront; por eso el HTTPS del sitio lo da API Gateway y los archivos siguen en S3.

## Repositorios

- https://github.com/NelsonCofre/mercadito-cloud-frontend
- https://github.com/NelsonCofre/mercadito-cloud-backend
