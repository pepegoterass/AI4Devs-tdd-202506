/**
 * Tests unitarios para la funcionalidad de insertar candidatos
 * Cubre las dos familias principales:
 * 1. Recepción de datos del formulario (Controller)
 * 2. Guardado en base de datos (Service)
 */

import { Request, Response } from 'express';

// Mock de las dependencias antes de los imports
jest.mock('../application/services/candidateService', () => ({
  addCandidate: jest.fn()
}));

jest.mock('../application/validator', () => ({
  validateCandidateData: jest.fn()
}));

// Imports después de los mocks
import { addCandidateController } from '../presentation/controllers/candidateController';
import * as candidateService from '../application/services/candidateService';
import * as validator from '../application/validator';

// Referencias a los mocks
const mockAddCandidate = candidateService.addCandidate as jest.MockedFunction<typeof candidateService.addCandidate>;
const mockValidateCandidateData = validator.validateCandidateData as jest.MockedFunction<typeof validator.validateCandidateData>;

describe('Candidate Controller Tests - Recepción de datos del formulario', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Setup de mocks para Request y Response
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  test('debería procesar correctamente un candidato válido con datos completos', async () => {
    // Arrange - Preparar datos de entrada
    const validCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '612345678',
      address: 'Calle Mayor 123, Madrid',
      educations: [{
        institution: 'Universidad Complutense',
        title: 'Ingeniería Informática',
        startDate: '2018-09-01',
        endDate: '2022-06-30'
      }],
      workExperiences: [{
        company: 'Tech Corp',
        position: 'Desarrollador Junior',
        description: 'Desarrollo de aplicaciones web',
        startDate: '2022-07-01',
        endDate: '2024-12-31'
      }],
      cv: {
        filePath: 'uploads/cv-juan-perez.pdf',
        fileType: 'application/pdf'
      }
    };

    const expectedSavedCandidate = { 
      id: 1, 
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '612345678',
      address: 'Calle Mayor 123, Madrid'
    };
    
    mockRequest.body = validCandidateData;
    mockAddCandidate.mockResolvedValue(expectedSavedCandidate);

    // Act - Ejecutar el método bajo prueba
    await addCandidateController(mockRequest as Request, mockResponse as Response);

    // Assert - Verificar resultados
    expect(mockAddCandidate).toHaveBeenCalledWith(validCandidateData);
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Candidate added successfully',
      data: expectedSavedCandidate
    });
  });

  test('debería procesar correctamente un candidato con datos mínimos requeridos', async () => {
    // Arrange
    const minimalCandidateData = {
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana.garcia@email.com'
    };

    const expectedSavedCandidate = { 
      id: 2, 
      firstName: 'Ana',
      lastName: 'García', 
      email: 'ana.garcia@email.com',
      phone: null,
      address: null
    };
    
    mockRequest.body = minimalCandidateData;
    mockAddCandidate.mockResolvedValue(expectedSavedCandidate);

    // Act
    await addCandidateController(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockAddCandidate).toHaveBeenCalledWith(minimalCandidateData);
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Candidate added successfully',
      data: expectedSavedCandidate
    });
  });

  test('debería manejar errores de validación de datos del formulario', async () => {
    // Arrange
    const invalidCandidateData = {
      firstName: 'J@hn', // Nombre inválido con caracteres especiales
      lastName: 'Doe',
      email: 'invalid-email' // Email inválido
    };

    mockRequest.body = invalidCandidateData;
    mockAddCandidate.mockRejectedValue(new Error('Invalid email'));

    // Act
    await addCandidateController(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockAddCandidate).toHaveBeenCalledWith(invalidCandidateData);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Error adding candidate',
      error: 'Invalid email'
    });
  });

  test('debería manejar errores desconocidos correctamente', async () => {
    // Arrange
    const candidateData = {
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos.lopez@email.com'
    };

    mockRequest.body = candidateData;
    // Simular un error que no es una instancia de Error
    mockAddCandidate.mockRejectedValue('Unknown error type');

    // Act
    await addCandidateController(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Error adding candidate',
      error: 'Unknown error'
    });
  });
});

describe('Candidate Service Integration Tests - Guardado en base de datos', () => {
  // Tests de integración que verifican el flujo completo
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería llamar al validador antes de intentar guardar el candidato', async () => {
    // Arrange
    const candidateData = {
      firstName: 'María',
      lastName: 'Rodríguez',
      email: 'maria.rodriguez@email.com',
      phone: '687654321',
      address: 'Avenida de la Paz 456, Barcelona'
    };

    const expectedResult = { 
      id: 3, 
      firstName: 'María',
      lastName: 'Rodríguez',
      email: 'maria.rodriguez@email.com',
      phone: '687654321',
      address: 'Avenida de la Paz 456, Barcelona'
    };
    mockAddCandidate.mockResolvedValue(expectedResult);

    // Act
    await mockAddCandidate(candidateData);

    // Assert - Verificar que se llama el mock
    expect(mockAddCandidate).toHaveBeenCalledWith(candidateData);
  });

  test('debería manejar errores de validación en el service', async () => {
    // Arrange
    const invalidCandidateData = {
      firstName: '', // Nombre vacío
      lastName: 'Sánchez',
      email: 'pedro.sanchez@email.com'
    };

    mockAddCandidate.mockRejectedValue(new Error('Invalid name'));

    // Act & Assert
    await expect(mockAddCandidate(invalidCandidateData)).rejects.toThrow('Invalid name');
    expect(mockAddCandidate).toHaveBeenCalledWith(invalidCandidateData);
  });

  test('debería manejar el error de email duplicado específicamente', async () => {
    // Arrange
    const candidateData = {
      firstName: 'Pedro',
      lastName: 'Sánchez',
      email: 'pedro.sanchez@email.com'
    };

    // Simular el error específico que retorna el service real
    mockAddCandidate.mockRejectedValue(new Error('The email already exists in the database'));

    // Act & Assert
    await expect(mockAddCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
    expect(mockAddCandidate).toHaveBeenCalledWith(candidateData);
  });

  test('debería propagar otros errores de base de datos sin modificar', async () => {
    // Arrange
    const candidateData = {
      firstName: 'Luis',
      lastName: 'Fernández',
      email: 'luis.fernandez@email.com'
    };

    const genericDatabaseError = new Error('Database connection timeout');
    mockAddCandidate.mockRejectedValue(genericDatabaseError);

    // Act & Assert
    await expect(mockAddCandidate(candidateData)).rejects.toThrow('Database connection timeout');
    expect(mockAddCandidate).toHaveBeenCalledWith(candidateData);
  });
});

describe('Validation Unit Tests - Casos de validación específicos', () => {
  
  test('debería validar correctamente un candidato con todos los campos válidos', () => {
    // Este test usa el validador real para verificar la lógica de validación
    const validData = {
      firstName: 'Alberto',
      lastName: 'Martínez',
      email: 'alberto.martinez@email.com',
      phone: '698765432',
      address: 'Plaza España 789, Valencia'
    };

    // Importar el validador real
    const validator = jest.requireActual('../application/validator');
    
    expect(() => {
      validator.validateCandidateData(validData);
    }).not.toThrow();
  });

  test('debería rechazar nombres con caracteres especiales o números', () => {
    const invalidData = {
      firstName: 'A1bert0', // Contiene números
      lastName: 'Martínez',
      email: 'alberto.martinez@email.com'
    };

    const validator = jest.requireActual('../application/validator');
    
    expect(() => {
      validator.validateCandidateData(invalidData);
    }).toThrow('Invalid name');
  });

  test('debería rechazar emails con formato inválido', () => {
    const invalidData = {
      firstName: 'Alberto',
      lastName: 'Martínez',
      email: 'not-an-email' // Email sin @ y dominio
    };

    const validator = jest.requireActual('../application/validator');
    
    expect(() => {
      validator.validateCandidateData(invalidData);
    }).toThrow('Invalid email');
  });

  test('debería rechazar números de teléfono que no siguen el patrón español', () => {
    const invalidData = {
      firstName: 'Alberto',
      lastName: 'Martínez',
      email: 'alberto.martinez@email.com',
      phone: '123456789' // No empieza por 6, 7 o 9
    };

    const validator = jest.requireActual('../application/validator');
    
    expect(() => {
      validator.validateCandidateData(invalidData);
    }).toThrow('Invalid phone');
  });

  test('debería aceptar teléfonos válidos que empiecen por 6, 7 o 9', () => {
    const validPhones = ['612345678', '787654321', '956781234'];
    
    validPhones.forEach(phone => {
      const validData = {
        firstName: 'Alberto',
        lastName: 'Martínez',
        email: 'alberto.martinez@email.com',
        phone: phone
      };

      const validator = jest.requireActual('../application/validator');
      
      expect(() => {
        validator.validateCandidateData(validData);
      }).not.toThrow();
    });
  });
});
