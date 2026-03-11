-- ============================================================
-- TALOS COACH — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla de hábitos (lista fija de hábitos)
CREATE TABLE IF NOT EXISTS habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  description TEXT,
  time_label  TEXT,          -- ej: "5:30 AM"
  sort_order  INT DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de registros diarios (un registro por hábito por día)
CREATE TABLE IF NOT EXISTS habit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  note        TEXT,
  completed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Tabla del diario personal
CREATE TABLE IF NOT EXISTS diary_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE NOT NULL UNIQUE,
  content     TEXT NOT NULL,
  mood        TEXT,           -- opcional: "bien", "regular", "mal"
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de notas (guardadas por TALOS o manualmente)
CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'personal',  -- prompt | idea | compras | trabajo | personal
  source      TEXT DEFAULT 'manual',             -- manual | talos
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de frases motivadoras
CREATE TABLE IF NOT EXISTS motivational_phrases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase      TEXT NOT NULL,
  author      TEXT,
  used_on     DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DATOS INICIALES: Hábitos
-- ============================================================
INSERT INTO habits (name, emoji, description, time_label, sort_order) VALUES
  ('Escribir pensamientos',   '✍️',  'Escribir reflexiones matutinas en el diario',        '5:30 AM',  1),
  ('Frase motivadora',        '💡',  'Leer y reflexionar sobre la frase del día',           '6:00 AM',  2),
  ('Hidratación y movimiento','💧',  'Tomar agua y hacer actividad física',                 '10:00 AM', 3),
  ('Leer en Headway',         '📚',  'Leer al menos 10 minutos en Headway',                 '10:30 PM', 4),
  ('Cierre del día',          '🌙',  'Revisar el día, preparar el mañana, relajarse',       '10:30 PM', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DATOS INICIALES: Frases motivadoras
-- ============================================================
INSERT INTO motivational_phrases (phrase, author) VALUES
  ('La disciplina es elegir entre lo que quieres ahora y lo que más quieres.', 'Abraham Lincoln'),
  ('El éxito es la suma de pequeños esfuerzos repetidos día tras día.', 'Robert Collier'),
  ('No se trata de ser mejor que los demás, sino de ser mejor que ayer.', 'Anónimo'),
  ('Cada día es una nueva oportunidad para cambiar tu vida.', 'Anónimo'),
  ('La constancia vence lo que la dicha no alcanza.', 'Refrán'),
  ('Haz hoy lo que otros no harán para poder mañana lo que otros no pueden.', 'Jerry Rice'),
  ('El único mal entrenamiento es el que no se hizo.', 'Anónimo'),
  ('Pequeños pasos diarios llevan a grandes resultados anuales.', 'Anónimo'),
  ('Tu cuerpo puede hacerlo. Es tu mente a quien tienes que convencer.', 'Anónimo'),
  ('La motivación te pone en marcha, el hábito te mantiene en movimiento.', 'Jim Rohn')
ON CONFLICT DO NOTHING;

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_habit_logs_date     ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_diary_date          ON diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_notes_category      ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created       ON notes(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — desactivado para uso con service key
-- Si usás anon key en el frontend, habilitá RLS y creá políticas
-- ============================================================
ALTER TABLE habits              DISABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs          DISABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries       DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes               DISABLE ROW LEVEL SECURITY;
ALTER TABLE motivational_phrases DISABLE ROW LEVEL SECURITY;
