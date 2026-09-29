# Cómo verificar las dos bases en Aurora

Hay un solo clúster, `mercadito-aurora`. Dentro están `product_db` y `cart_db`. La consola de RDS no las muestra: el `(2)` de esa pantalla es el clúster y su instancia de escritura.

Aurora no tiene acceso público. Hay que entrar desde la instancia de productos, que está en la misma VPC. El paso de SSH está en `ACCESO-EC2.md`.

## 1. Entrar a productos

Usa la IPv4 pública de `mercadito-productos`:

```powershell
ssh -i "C:\Users\mipc\Downloads\pepoito\mercadito-key.pem" ec2-user@IP_PUBLICA
```

## 2. Ver usuario y contraseña

```bash
grep SPRING_DATASOURCE_ /home/ec2-user/productos.env
```

El usuario es el valor de `SPRING_DATASOURCE_USERNAME`. La contraseña es el valor de `SPRING_DATASOURCE_PASSWORD`. Esos valores también están en `CREDENCIALES.md`, que no se sube a Git.

`mercadito` y `12345` son ejemplos de los archivos locales. No son la contraseña de Aurora.

## 3. Conectarse

Si `psql` no está instalado:

```bash
sudo dnf install -y postgresql15
```

Sustituye `EL_USUARIO` por el usuario del archivo. No escribas la palabra `USUARIO`:

```bash
psql "host=mercadito-aurora.cluster-cxsmzlz2qb3k.us-east-1.rds.amazonaws.com dbname=postgres user=EL_USUARIO sslmode=require"
```

`sslmode=require` hace falta porque Aurora rechaza la conexión sin cifrado.

## 4. Listar las bases

No uses `\l`. El cliente de la instancia es psql 15 y Aurora es PostgreSQL 17, y ese comando falla. Ejecuta:

```sql
SELECT datname FROM pg_database ORDER BY datname;
```

Deben aparecer `product_db` y `cart_db`. Las otras (`postgres`, `rdsadmin`, `template0`, `template1`) las crea PostgreSQL y no las usa la aplicación.

`product_db` la usa productos-service. `cart_db` la usa carrito-service. Para salir: `\q`.
