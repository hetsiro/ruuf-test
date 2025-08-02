# Visualizador de Techo Solar

Herramienta para visualizar cómo colocar paneles solares en un techo rectangular. Calcula la mejor configuración para maximizar el número de paneles.

## Link del proyecto

La app la puedes probar directamente entrando al link https://ruuf-test-wheat.vercel.app

## Tecnologías

- React 19.1.0
- TypeScript 5
- Tailwind CSS 4
- Next.js 15.4.5

## Instalación

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd ruuf-test
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador:**
   Ve a [http://localhost:3000](http://localhost:3000)

## Qué hace

Toma las dimensiones del techo (x, y) y de los paneles (a, b), y encuentra la mejor manera de colocarlos. Muestra el resultado en una matriz visual donde cada panel tiene un número único.

## Cómo funciona

Prueba 5 estrategias diferentes y elige la que coloca más paneles:

1. **Solo horizontales**: Coloca todos los paneles en orientación horizontal (a x b)
2. **Solo verticales**: Coloca todos los paneles en orientación vertical (b x a)
3. **Mezcla H+V**: Comienza con horizontales, luego agrega verticales donde quepa
4. **Mezcla V+H**: Comienza con verticales, luego agrega horizontales donde quepa
5. **División dinámica**: Prueba todos los puntos de división posibles con ambos patrones (H/V y V/H)

## ¿Por qué solo 5 estrategias?

Probar **todas** las combinaciones posibles sería computacionalmente imposible. Por ejemplo, un techo 6x6 tendría 3^36 = 150 billones de combinaciones posibles.

Las 5 estrategias cubren los casos más comunes y se ejecutan en tiempo razonable.

## Cómo usar

1. Ingresa dimensiones de paneles (a, b)
2. Ingresa dimensiones del techo (x, y)
3. Presiona "Calculate"
4. Mira el resultado

## Portafolio con proyectos reales

https://cristobal-fuentealba.vercel.app