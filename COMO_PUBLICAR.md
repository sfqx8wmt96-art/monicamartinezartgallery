# Cómo publicar el catálogo en monicamartinezartgallery.com

Esta guía te lleva paso a paso para que tu dominio comprado en **Squarespace (antes Google Domains)** muestre tu catálogo de arte. Usaremos **Netlify** porque es gratis y muy fácil.

---

## Paso 1 — Subir el sitio a Netlify (5 minutos)

1. Entra a **https://app.netlify.com/signup** y crea una cuenta (puedes usar tu correo o tu cuenta de Google).
2. Una vez dentro, busca el botón **"Add new site" → "Deploy manually"**.
   - También puede aparecer como una caja grande que dice *"Drag and drop your site output folder here"*.
3. **Arrastra toda la carpeta `catalogo-arte`** (la que tiene `index.html`, `style.css`, `script.js`, `datos.json` y la carpeta `images`) a esa caja.
4. Netlify subirá los archivos y te dará un link tipo `random-name-12345.netlify.app`. Ese ya es tu sitio funcionando — pruébalo en tu navegador.

> Tip: si quieres cambiar ese nombre raro a algo como `monica-martinez.netlify.app`, ve a **Site configuration → Change site name**.

---

## Paso 2 — Conectar tu dominio en Netlify (2 minutos)

1. Dentro del sitio en Netlify, ve a **Domain management → Add a domain**.
2. Escribe `monicamartinezartgallery.com` y dale **Verify → Add domain**.
3. Netlify te va a mostrar **2 datos importantes** que tienes que copiar:
   - Un registro tipo **A** apuntando a la IP `75.2.60.5`
   - Un registro tipo **CNAME** para `www` apuntando a `apex-loadbalancer.netlify.com` (o algo parecido).

Déjalos abiertos en una pestaña — los vamos a usar en el siguiente paso.

---

## Paso 3 — Configurar el DNS en Squarespace (5 minutos)

Como compraste el dominio en Google Domains y eso pasó a Squarespace:

1. Entra a **https://account.squarespace.com/domains**.
2. Haz click en **monicamartinezartgallery.com**.
3. Busca la opción **"DNS" → "DNS Settings"** (puede estar como "Use this domain with another service" o "Custom Records").
4. Agrega los registros que Netlify te dio:

   | Tipo  | Host | Apunta a                       |
   |-------|------|--------------------------------|
   | A     | @    | 75.2.60.5                      |
   | CNAME | www  | apex-loadbalancer.netlify.com  |

   > Usa los valores **exactos que Netlify te muestre a ti** — pueden cambiar con el tiempo. Lo que escribí arriba es solo de ejemplo.

5. Guarda.

---

## Paso 4 — Esperar y prender el HTTPS (10 min a 1 hora)

1. Vuelve a Netlify → **Domain management**.
2. Espera a que el dominio aparezca como **"Netlify DNS" verde** o **"DNS verification passed"**. Puede tardar de 10 minutos a 1 hora (a veces más).
3. Cuando ya esté verde, baja a **HTTPS** y haz click en **"Verify DNS configuration"** y luego **"Provision certificate"**. Esto te da el candado 🔒 gratis automáticamente.

---

## Paso 5 — Probar

Entra a **https://monicamartinezartgallery.com** y deberías ver tu catálogo funcionando.

---

## ¿Cómo actualizar el catálogo después?

Cada vez que cambies `datos.json` o agregues imágenes:

1. Ve a Netlify → tu sitio → **Deploys**.
2. Arrastra de nuevo la carpeta `catalogo-arte` completa a la caja "Drag and drop".
3. En 30 segundos los cambios están en vivo.

---

## Si algo sale mal

- **El dominio no carga después de 1 hora:** revisa que los registros DNS en Squarespace estén escritos exactamente como Netlify pide. Un espacio o punto de más rompe todo.
- **Sale "Not secure" en el navegador:** todavía no se provisionó el certificado HTTPS. Espera 30 minutos más y vuelve a darle "Provision certificate" en Netlify.
- **Las imágenes no se ven:** asegúrate de haber subido la carpeta `images` completa junto con todo lo demás.
