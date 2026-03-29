-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.appointment_data (
  title character varying,
  reportType character varying,
  status character varying DEFAULT 'draft'::character varying,
  createdAt timestamp with time zone DEFAULT now(),
  needAsap boolean DEFAULT false,
  follow_up_questions jsonb,
  follow_up_answers jsonb,
  pre_appointment_report jsonb,
  recommended_speciality character varying,
  selected_time character varying,
  post_appointment_report jsonb,
  doctor_rating double precision,
  doctor_rating_text text,
  patientId uuid,
  doctorId uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  initial_prompt text,
  CONSTRAINT appointment_data_pkey PRIMARY KEY (id),
  CONSTRAINT appointment_data_patient_id_fkey FOREIGN KEY (patientId) REFERENCES public.patients(id),
  CONSTRAINT appointment_data_doctor_id_fkey FOREIGN KEY (doctorId) REFERENCES public.doctors(id)
);
CREATE TABLE public.doctors (
  fullName character varying,
  practiceName character varying,
  email character varying UNIQUE,
  phone character varying,
  createdAt timestamp with time zone DEFAULT now(),
  speciality character varying,
  timeAvailable jsonb,
  rating double precision DEFAULT 0,
  reviewCount integer DEFAULT 0,
  location character varying,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  password character varying,
  gender character varying,
  age smallint,
  CONSTRAINT doctors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.forum_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forum_comments_pkey PRIMARY KEY (id),
  CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id),
  CONSTRAINT forum_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.patients(id)
);
CREATE TABLE public.forum_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags ARRAY,
  upvotes integer NOT NULL DEFAULT 0,
  downvotes integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forum_posts_pkey PRIMARY KEY (id),
  CONSTRAINT forum_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.patients(id)
);
CREATE TABLE public.patients (
  fullName character varying,
  email character varying UNIQUE,
  createdAt timestamp with time zone DEFAULT now(),
  location character varying,
  gender character varying,
  age smallint,
  phone character varying,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  password character varying,
  CONSTRAINT patients_pkey PRIMARY KEY (id)
);