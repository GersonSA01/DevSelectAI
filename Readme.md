
# DevSelectAI

Sistema de entrevistas inteligentes con IA para procesos de selección de personal, que combina evaluaciones teóricas, técnicas y orales con monitoreo por cámara.

------------------------------
Características Principales
------------------------------
- Entrevistas con IA: Sistema de entrevistas orales procesadas con OpenAI GPT-4.
- Evaluaciones Teóricas: Preguntas de opción múltiple con calificación automática.
- Desafíos Técnicos: Evaluación de código con criterios de calidad, compilación y resolución.
- Monitoreo por Cámara: Capturas de pantalla para validación de integridad.
- Sistema de Puntuación: Evaluación integral con puntaje máximo de 20 puntos.

------------------------------
Arquitectura del Sistema
------------------------------

**Backend (Node.js + Express)**
- API REST: Endpoints organizados con prefijo `/api/`.
- Base de Datos: Sequelize ORM con modelos relacionales.
- Integración IA: OpenAI GPT-4 para procesamiento de entrevistas.
- Autenticación: Sistema basado en tokens para acceso seguro.

**Frontend (Next.js + React)**
- Interfaz Postulante: Proceso de entrevista guiado paso a paso.
- Panel Reclutador: Sistema de evaluación y calificación.
- Componentes Modulares: Arquitectura basada en componentes reutilizables.

------------------------------
Sistema de Evaluación
------------------------------

Módulo               | Puntuación Máxima | Descripción
---------------------|-------------------|------------------------------------------
Entrevista Oral      | 6 puntos          | Evaluación conversacional con IA.
Preguntas Teóricas   | 5 puntos          | Conocimientos técnicos básicos.
Desafío Técnico      | 7 puntos          | Resolución de problemas de código.
Capturas de Cámara   | 2 puntos          | Monitoreo de integridad.

------------------------------
Instalación y Configuración
------------------------------

**Prerrequisitos**
- Node.js 18+
- MySQL/PostgreSQL
- Cuenta OpenAI API

**Backend**
- cd backend
- npm install
- copy .env
- npm run dev

**Frontend**
- cd frontend
- npm install
- npm run dev
- copy .env.local

------------------------------
Variables de Entorno
------------------------------

**Backend**
- PORT=port
- OPENAI_API_KEY=your_openai_key
- EMAIL_USER=email_user
- EMAIL_PASS=email_pass
- URL_FRONTEND=http://localhost:3000
- JWT_SECRET=mi_clave_secreta

**Frontend**
- NEXT_PUBLIC_API_URL=http://localhost:5000

------------------------------
Flujo de Evaluación
------------------------------
- Registro: Candidato se registra con token de invitación.
- Evaluación Teórica: 5 preguntas de opción múltiple.
- Entrevista Oral: Conversación procesada por IA.
- Desafío Técnico: Resolución de problema de código.
- Calificación: Reclutador evalúa y asigna puntajes finales.

------------------------------
Endpoints Principales
------------------------------

**Gestión de Postulantes**
- POST /api/postulante - Crear postulante.
- GET /api/postulante/token/:token - Acceso por token.
- POST /api/postulante/habilidades - Guardar habilidades.

**Sistema de Evaluación**
- POST /api/evaluacion/:id/crear - Inicializar evaluación.
- PUT /api/evaluacion/:id/responder - Responder pregunta.
- POST /api/evaluacion/ayuda-ia - Solicitar ayuda IA.

**Calificación**
- PUT /api/calificar/entrevista-oral - Calificar entrevista.
- PUT /api/calificar/tecnica - Calificar desafío técnico.
- PUT /api/calificar/general - Calificación final.

------------------------------
Tecnologías Utilizadas
------------------------------
- Backend: Node.js, Express.js, Sequelize ORM
- Frontend: Next.js, React, Tailwind CSS
- Base de Datos: MySQL/PostgreSQL
- IA: OpenAI GPT-4
- Autenticación: JWT
- Email: Nodemailer

------------------------------
Equipo de Desarrollo
------------------------------
- Gerson Suarez Aguirre: GersonSA01 (https://github.com/GersonSA01)
- Angeles Valdospin Nahomi: Angeles1229 (https://github.com/Angeles1229)
