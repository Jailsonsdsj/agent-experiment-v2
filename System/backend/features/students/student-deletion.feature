@students
Feature: Student Deletion

  Scenario: Successfully delete a student with no enrollments
    Given a student named "Bruno Santos" with CPF "987.654.321-00" and email "bruno.santos@universidade.br" is registered
    When the student with CPF "987.654.321-00" is deleted
    Then the student "Bruno Santos" should not appear in the student list

  @enrollment @negative
  Scenario: Reject deletion of an enrolled student
    Given a student named "Carla Mendes" with CPF "111.222.333-44" and email "carla.mendes@universidade.br" is registered
    And "Carla Mendes" is enrolled in a class
    When the student with CPF "111.222.333-44" is deleted
    Then the deletion should be rejected
    And the system should indicate that the student is enrolled in a class

  Scenario: Deleting a student also removes their evaluations
    Given a student named "Diego Ferreira" with CPF "444.555.666-77" and email "diego.ferreira@universidade.br" is registered
    And "Diego Ferreira" has an evaluation on record
    When the student with CPF "444.555.666-77" is deleted
    Then no evaluations for "Diego Ferreira" should remain in the system
