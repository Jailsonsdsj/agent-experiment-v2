@students
Feature: Student Editing

  Background:
    Given a student named "Ana Lima" with CPF "123.456.789-09" and email "ana.lima@universidade.br" is registered
    And a student named "Bruno Santos" with CPF "987.654.321-00" and email "bruno.santos@universidade.br" is registered

  Scenario: Successfully update a student's contact information
    When the student with CPF "123.456.789-09" is updated with name "Ana Lima Souza" and email "ana.souza@universidade.br"
    Then the student record should show name "Ana Lima Souza" and email "ana.souza@universidade.br"

  @negative
  Scenario: Reject update when new CPF belongs to another student
    When the student with CPF "123.456.789-09" is updated with CPF "987.654.321-00"
    Then the update should be rejected
    And the system should indicate that the CPF is already in use

  Scenario: Allow update when student keeps their own CPF
    When the student with CPF "123.456.789-09" is updated with name "Ana Lima" and CPF "123.456.789-09"
    Then the student record should show name "Ana Lima" and CPF "123.456.789-09"
