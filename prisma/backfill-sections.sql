-- Da acceso a ambas secciones a los usuarios que aún no tienen ninguna asignada,
-- para que nadie se quede bloqueado tras introducir las secciones.
UPDATE "User"
SET "sections" = ARRAY['ESCALAS_MEDICAS', 'PROGRAMACION']::"Section"[]
WHERE cardinality("sections") = 0;
