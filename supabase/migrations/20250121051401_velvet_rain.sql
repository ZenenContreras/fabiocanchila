/*
  # Add default services

  1. New Data
    - Adds default services for:
      - Canvas del Éxito y la Prosperidad
      - Consultoría Empresarial
      - Coaching Personal y Profesional

  2. Changes
    - Inserts initial service records
*/

-- Insert default services if they don't exist
INSERT INTO services (id, title, description, content, youtube_url, icon, order_index)
SELECT 
  gen_random_uuid(),
  'Canvas del Éxito y la Prosperidad',
  'Metodología única para estructurar y planificar tus metas en todas las áreas de tu vida.',
  'Aprende a utilizar esta poderosa herramienta para transformar tus sueños en realidad.',
  'https://www.youtube.com/@fabiocanchila',
  'LayoutTemplate',
  0
WHERE NOT EXISTS (
  SELECT 1 FROM services WHERE title = 'Canvas del Éxito y la Prosperidad'
);

INSERT INTO services (id, title, description, content, icon, order_index)
SELECT 
  gen_random_uuid(),
  'Consultoría Empresarial',
  'Asesoría especializada para el fortalecimiento y crecimiento de tu organización.',
  'Soluciones prácticas y estratégicas para los desafíos de tu empresa.',
  'Building2',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM services WHERE title = 'Consultoría Empresarial'
);

INSERT INTO services (id, title, description, content, icon, order_index)
SELECT 
  gen_random_uuid(),
  'Coaching Personal y Profesional',
  'Acompañamiento personalizado para alcanzar tus objetivos y desarrollar tu máximo potencial.',
  'Descubre y potencia tus capacidades para lograr el éxito que deseas.',
  'Target',
  2
WHERE NOT EXISTS (
  SELECT 1 FROM services WHERE title = 'Coaching Personal y Profesional'
);