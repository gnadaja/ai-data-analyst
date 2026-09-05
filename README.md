# AI Data Analyst

Plataforma web para subir datasets CSV/Excel y analizarlos mediante lenguaje natural con herramientas controladas.

## Estructura

- `frontend/`: Next.js, TypeScript, Tailwind CSS y App Router.
- `backend/`: FastAPI, futura ingesta con Pandas/NumPy y capa `AIService`.
- `docs/`: decisiones de arquitectura, contrato API y seguridad.

## Desarrollo local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

La API estará disponible en `http://localhost:8000` y su documentación en `http://localhost:8000/docs`.

## Activar datasets en Supabase

1. Abre el proyecto de Supabase.
2. Ve a **SQL Editor**.
3. Crea una nueva consulta.
4. Copia el contenido de `supabase/migrations/202609050001_ai_data_foundation.sql`.
5. Ejecuta la consulta.

La migración crea las tablas privadas de AI Data Analyst, el bucket privado `ai-datasets`, las políticas RLS y el perfil automático para usuarios nuevos. No ejecutes este SQL en otro proyecto sin revisar primero las políticas existentes.

Después de ejecutar la migración, prueba el flujo en producción:

1. Inicia sesión en el frontend.
2. Abre `/dashboard`.
3. Sube un CSV pequeño.
4. Comprueba que aparece en la lista de datasets.
5. En Supabase revisa **Storage → ai-datasets** y confirma que el archivo está dentro de la carpeta del usuario.

## Principios técnicos

- Los datasets pertenecen a un usuario y se mantienen privados.
- La IA podrá solicitar únicamente herramientas analíticas registradas.
- No se utilizarán `exec()` ni `eval()` para ejecutar código generado por la IA.
- Las claves y credenciales vivirán solamente en variables de entorno del backend.
