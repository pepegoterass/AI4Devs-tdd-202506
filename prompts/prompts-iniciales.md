# Prompts Iniciales - Tests Unitarios para LTI Sistema de Candidatos

## Contexto del Ejercicio
Crear una suite de tests unitarios en Jest para la funcionalidad de insertar candidatos en base de datos del sistema LTI (Talent Tracking System). El objetivo es cubrir las dos familias principales de tests:

1. **Recepción de datos del formulario** (Controller Layer)
2. **Guardado en base de datos** (Service Layer)

## Prompts Utilizados

### 1. Análisis del Proyecto
**Prompt**: "Analiza la estructura del proyecto LTI y identifica los archivos principales relacionados con la funcionalidad de insertar candidatos. Necesito entender el flujo desde el controlador hasta la base de datos."

**Resultado**: Identifiqué los archivos clave:
- `candidateController.ts` - Maneja las requests HTTP
- `candidateService.ts` - Lógica de negocio y persistencia
- `validator.ts` - Validación de datos de entrada
- `Candidate.ts` - Modelo de dominio

### 2. Configuración de Jest
**Prompt**: "El proyecto ya tiene Jest instalado pero necesito configurar correctamente TypeScript y los mocks. ¿Cuál es la mejor configuración para Jest con TypeScript en este proyecto?"

**Resultado**: Configuré:
- `jest.config.js` con preset ts-jest
- TypeScript configurado para ES2018
- Mocks para PrismaClient y dependencias

### 3. Tests del Controller (Recepción de datos)
**Prompt**: "Crea tests unitarios para el `addCandidateController` que verifiquen:
- Procesamiento correcto de datos válidos completos
- Procesamiento de datos mínimos requeridos
- Manejo de errores de validación
- Manejo de errores desconocidos
- Verificación de códigos de estado HTTP correctos"

**Resultado**: 4 tests que cubren todos los casos de uso del controller, usando mocks de Express Request/Response.

### 4. Tests del Service (Guardado en BD)
**Prompt**: "Crea tests unitarios para `candidateService.addCandidate` que verifiquen:
- Llamada al validador antes del guardado
- Manejo específico de error P2002 de Prisma (email duplicado)
- Propagación de otros errores de base de datos
- Flujo completo de guardado exitoso"

**Resultado**: 4 tests de integración que verifican el flujo completo del service, incluyendo mocks del modelo Candidate.

### 5. Tests de Validación
**Prompt**: "Crea tests unitarios para las funciones de validación que verifiquen:
- Validación exitosa con datos correctos
- Rechazo de nombres con caracteres inválidos
- Rechazo de emails malformados
- Rechazo de teléfonos que no siguen el patrón español
- Aceptación de teléfonos válidos españoles"

**Resultado**: 5 tests que usan el validador real (no mocks) para verificar la lógica de validación.

## Buenas Prácticas Aplicadas

### Estructura de Tests
- **Arrange-Act-Assert pattern**: Cada test sigue claramente esta estructura
- **Descriptive test names**: Nombres en español que describen exactamente qué verifica cada test
- **Setup and teardown**: `beforeEach` para limpiar mocks entre tests

### Mocking Strategy
- **Mocks selectivos**: Solo se mockean las dependencias externas necesarias
- **Real implementations**: Los tests de validación usan implementaciones reales
- **Proper cleanup**: `jest.clearAllMocks()` en cada `beforeEach`

### Test Coverage
- **Controller layer**: Tests de recepción y procesamiento de datos HTTP
- **Service layer**: Tests de lógica de negocio y persistencia
- **Validation layer**: Tests de reglas de validación específicas
- **Error handling**: Cobertura de todos los tipos de error posibles

### TypeScript Integration
- **Type safety**: Todos los mocks mantienen type safety
- **Proper imports**: Imports correctos de tipos Express
- **Configuration**: Jest configurado apropiadamente para TypeScript

## Casos de Test Implementados

### Controller Tests (4 tests)
1. ✅ Candidato válido con datos completos
2. ✅ Candidato con datos mínimos requeridos  
3. ✅ Manejo de errores de validación
4. ✅ Manejo de errores desconocidos

### Service Tests (4 tests)
1. ✅ Validación antes del guardado
2. ✅ Error de email duplicado (P2002)
3. ✅ Propagación de errores de BD
4. ✅ Flujo de guardado exitoso

### Validation Tests (5 tests)
1. ✅ Datos válidos completos
2. ✅ Nombres con caracteres inválidos
3. ✅ Emails malformados
4. ✅ Teléfonos inválidos
5. ✅ Teléfonos válidos españoles

## Comandos de Ejecución

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con coverage
npm test -- --coverage

# Ejecutar solo el archivo de tests iniciales
npm test tests-iniciales.test.ts

# Ejecutar en modo watch
npm test -- --watch
```

## Notas Técnicas

- **Base de datos**: Se mockea completamente para evitar dependencias externas
- **Prisma**: Se simula el comportamiento de errores específicos como P2002
- **Express**: Se mockean Request y Response para tests de controller
- **TypeScript**: Configuración compatible con Jest y las características modernas de ES

Los tests están diseñados para ser **rápidos**, **determinísticos** y **mantenibles**, siguiendo las mejores prácticas de testing unitario.
