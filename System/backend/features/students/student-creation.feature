@students
Feature: Student Registration

  Scenario: Successfully register a new student
    Given no student with CPF "123.456.789-09" exists in the system
    When a new student is registered with name "Ana Lima", CPF "123.456.789-09" and email "ana.lima@universidade.br"
    Then the student "Ana Lima" should appear in the student list

  @negative
  Scenario: Reject registration when CPF is already in use
    Given a student named "Ana Lima" with CPF "123.456.789-09" and email "ana.lima@universidade.br" is registered
    When a new student is registered with name "Carla Mendes", CPF "123.456.789-09" and email "carla.mendes@universidade.br"
    Then the registration should be rejected
    And the system should indicate that the CPF is already in use

  @negative
  Scenario: Reject registration when CPF format is invalid
    When a new student is registered with name "Diego Ferreira", CPF "11111111111" and email "diego.ferreira@universidade.br"
    Then the registration should be rejected
    And the system should indicate that the CPF format is invalid
