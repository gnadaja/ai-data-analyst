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

## Principios técnicos

- Los datasets pertenecen a un usuario y se mantienen privados.
- La IA podrá solicitar únicamente herramientas analíticas registradas.
- No se utilizarán `exec()` ni `eval()` para ejecutar código generado por la IA.
- Las claves y credenciales vivirán solamente en variables de entorno del backend.
