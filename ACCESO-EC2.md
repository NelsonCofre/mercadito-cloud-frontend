# Cómo entrar a cada EC2

Las tres instancias están en la VPC por defecto, región `us-east-1`. El usuario de Linux es `ec2-user`. La llave es `C:\Users\mipc\Downloads\pepoito\mercadito-key.pem`.

El laboratorio tiene que estar abierto y la instancia en estado En ejecución. El grupo de seguridad solo acepta el puerto 22 desde la IP actual de tu computador.

Desde tu PC se usa la IP pública. Las IP privadas (`172.31.x.x`) no responden desde fuera de la VPC.

## BFF

Nombre: `mercadito-bff`. IP privada: `172.31.30.247`. Esta instancia tiene IP elástica, así que la dirección no cambia al reiniciar:

```powershell
ssh -i "C:\Users\mipc\Downloads\pepoito\mercadito-key.pem" ec2-user@44.197.90.172
```

El BFF no tiene la contraseña de Aurora. Para ver las bases, entra a productos.

## productos-service

Nombre: `mercadito-productos`. IP privada: `172.31.28.236`.

1. En la consola de EC2 abre esa instancia.
2. Copia la IPv4 pública. Cambia cada vez que la instancia se detiene y se vuelve a iniciar.
3. En PowerShell, reemplaza `IP_PUBLICA`:

```powershell
ssh -i "C:\Users\mipc\Downloads\pepoito\mercadito-key.pem" ec2-user@IP_PUBLICA
```

El archivo de conexión a Aurora está en `/home/ec2-user/productos.env`.

## carrito-service

Nombre: `mercadito-carrito`. IP privada: `172.31.24.14`.

El paso es el mismo que en productos: copia la IPv4 pública de la consola y úsala en el `ssh`. Su archivo de entorno está en la propia instancia.

## Si Windows rechaza la llave

```powershell
icacls "C:\Users\mipc\Downloads\pepoito\mercadito-key.pem" /inheritance:r
icacls "C:\Users\mipc\Downloads\pepoito\mercadito-key.pem" /grant:r "$($env:USERNAME):(R)"
```

La primera vez que conectas, SSH pregunta si confías en el servidor. Escribe `yes`. Para salir de la instancia, escribe `exit`.
