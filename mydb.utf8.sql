--
-- PostgreSQL database dump
--

\restrict tQfYA6EfCNIuiadvPfv3GA0NSliba1HoXfC6LY3RjfVSrYNkDltOv2A2FFmt2zE

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: equipment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.equipment_status AS ENUM (
    'OPERATIONAL',
    'UNDER_REPAIR',
    'ARCHIVED'
);


ALTER TYPE public.equipment_status OWNER TO postgres;

--
-- Name: equipmentstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.equipmentstatus AS ENUM (
    'OPERATIONAL',
    'UNDER_REPAIR',
    'ARCHIVED'
);


ALTER TYPE public.equipmentstatus OWNER TO postgres;

--
-- Name: CAST (public.equipmentstatus AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.equipmentstatus AS character varying) WITH INOUT AS IMPLICIT;


--
-- Name: CAST (character varying AS public.equipmentstatus); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.equipmentstatus) WITH INOUT AS IMPLICIT;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerts (
    id integer NOT NULL,
    equipment_id integer,
    work_order_id integer,
    meter_id integer,
    alert_type character varying(50),
    message text,
    status character varying(30) DEFAULT 'open'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.alerts OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id bigint,
    action_type character varying(100),
    entity_name character varying(100),
    entity_id bigint,
    action_details text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: claim_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claim_photos (
    photo_id integer NOT NULL,
    claim_id integer,
    photo_url text
);


ALTER TABLE public.claim_photos OWNER TO postgres;

--
-- Name: claim_photos_photo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.claim_photos_photo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claim_photos_photo_id_seq OWNER TO postgres;

--
-- Name: claim_photos_photo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.claim_photos_photo_id_seq OWNED BY public.claim_photos.photo_id;


--
-- Name: claim_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claim_status_history (
    id integer NOT NULL,
    claim_id integer,
    old_status character varying(50),
    new_status character varying(50),
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reason character varying(255)
);


ALTER TABLE public.claim_status_history OWNER TO postgres;

--
-- Name: claim_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.claim_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claim_status_history_id_seq OWNER TO postgres;

--
-- Name: claim_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.claim_status_history_id_seq OWNED BY public.claim_status_history.id;


--
-- Name: claims; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claims (
    claim_id integer NOT NULL,
    requester_id integer,
    equipment_id integer,
    description text,
    status character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.claims OWNER TO postgres;

--
-- Name: claims_claim_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.claims_claim_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claims_claim_id_seq OWNER TO postgres;

--
-- Name: claims_claim_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.claims_claim_id_seq OWNED BY public.claims.claim_id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id bigint NOT NULL,
    department_name character varying(100) NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    equipment_id bigint NOT NULL,
    name character varying(100),
    serial_number character varying(100),
    status character varying(50),
    location character varying(100),
    department_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: equipment_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_documents (
    id bigint NOT NULL,
    equipment_id bigint,
    document_name text,
    file_path text,
    content_type character varying(255),
    file_size bigint
);


ALTER TABLE public.equipment_documents OWNER TO postgres;

--
-- Name: equipment_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_documents_id_seq OWNER TO postgres;

--
-- Name: equipment_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_documents_id_seq OWNED BY public.equipment_documents.id;


--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_equipment_id_seq OWNER TO postgres;

--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_equipment_id_seq OWNED BY public.equipment.equipment_id;


--
-- Name: equipment_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_history (
    id bigint NOT NULL,
    equipment_id bigint,
    action text,
    performed_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment_history OWNER TO postgres;

--
-- Name: equipment_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_history_id_seq OWNER TO postgres;

--
-- Name: equipment_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_history_id_seq OWNED BY public.equipment_history.id;


--
-- Name: failure_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failure_logs (
    id integer NOT NULL,
    equipment_id integer,
    work_order_id integer,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.failure_logs OWNER TO postgres;

--
-- Name: failure_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failure_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failure_logs_id_seq OWNER TO postgres;

--
-- Name: failure_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failure_logs_id_seq OWNED BY public.failure_logs.id;


--
-- Name: labor_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.labor_logs (
    id integer NOT NULL,
    work_order_id integer,
    technician_id integer,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    hours_spent numeric(6,2),
    notes text
);


ALTER TABLE public.labor_logs OWNER TO postgres;

--
-- Name: labor_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.labor_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.labor_logs_id_seq OWNER TO postgres;

--
-- Name: labor_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.labor_logs_id_seq OWNED BY public.labor_logs.id;


--
-- Name: maintenance_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_costs (
    id integer NOT NULL,
    work_order_id integer,
    labor_cost numeric(12,2) DEFAULT 0,
    parts_cost numeric(12,2) DEFAULT 0,
    external_cost numeric(12,2) DEFAULT 0,
    total_cost numeric(12,2) GENERATED ALWAYS AS (((labor_cost + parts_cost) + external_cost)) STORED
);


ALTER TABLE public.maintenance_costs OWNER TO postgres;

--
-- Name: maintenance_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_costs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_costs_id_seq OWNER TO postgres;

--
-- Name: maintenance_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_costs_id_seq OWNED BY public.maintenance_costs.id;


--
-- Name: maintenance_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_plans (
    plan_id bigint NOT NULL,
    equipment_id bigint,
    frequency character varying(50),
    interval_unit character varying(255),
    interval_value integer,
    last_performed_at timestamp(6) without time zone,
    name character varying(255),
    next_due_at timestamp(6) without time zone,
    status character varying(255),
    technician_name character varying(255)
);


ALTER TABLE public.maintenance_plans OWNER TO postgres;

--
-- Name: maintenance_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_plans_plan_id_seq OWNER TO postgres;

--
-- Name: maintenance_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_plans_plan_id_seq OWNED BY public.maintenance_plans.plan_id;


--
-- Name: meter_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meter_logs (
    log_id bigint NOT NULL,
    meter_id bigint,
    value double precision,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.meter_logs OWNER TO postgres;

--
-- Name: meter_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meter_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meter_logs_log_id_seq OWNER TO postgres;

--
-- Name: meter_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meter_logs_log_id_seq OWNED BY public.meter_logs.log_id;


--
-- Name: meter_thresholds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meter_thresholds (
    id bigint NOT NULL,
    meter_id bigint,
    threshold_value double precision
);


ALTER TABLE public.meter_thresholds OWNER TO postgres;

--
-- Name: meter_thresholds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meter_thresholds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meter_thresholds_id_seq OWNER TO postgres;

--
-- Name: meter_thresholds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meter_thresholds_id_seq OWNED BY public.meter_thresholds.id;


--
-- Name: meters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meters (
    meter_id bigint NOT NULL,
    equipment_id bigint,
    value double precision,
    meter_type character varying(50),
    last_reading_at timestamp(6) without time zone,
    name character varying(255),
    unit character varying(255)
);


ALTER TABLE public.meters OWNER TO postgres;

--
-- Name: meters_meter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meters_meter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meters_meter_id_seq OWNER TO postgres;

--
-- Name: meters_meter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meters_meter_id_seq OWNED BY public.meters.meter_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying(150),
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: part_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.part_movements (
    id integer NOT NULL,
    part_id integer,
    quantity integer,
    movement_type character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.part_movements OWNER TO postgres;

--
-- Name: part_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.part_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.part_movements_id_seq OWNER TO postgres;

--
-- Name: part_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.part_movements_id_seq OWNED BY public.part_movements.id;


--
-- Name: parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parts (
    part_id integer NOT NULL,
    name character varying(100),
    stock_quantity integer,
    min_stock integer,
    unit_cost numeric(10,2)
);


ALTER TABLE public.parts OWNER TO postgres;

--
-- Name: parts_part_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parts_part_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parts_part_id_seq OWNER TO postgres;

--
-- Name: parts_part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parts_part_id_seq OWNED BY public.parts.part_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id bigint NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_role_id_seq OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedules (
    id integer NOT NULL,
    work_order_id integer,
    technician_id integer,
    planned_date date,
    start_time time without time zone,
    end_time time without time zone
);


ALTER TABLE public.schedules OWNER TO postgres;

--
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedules_id_seq OWNER TO postgres;

--
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedules_id_seq OWNED BY public.schedules.id;


--
-- Name: task_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_steps (
    id integer NOT NULL,
    task_id integer,
    step_name text,
    status character varying(50)
);


ALTER TABLE public.task_steps OWNER TO postgres;

--
-- Name: task_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_steps_id_seq OWNER TO postgres;

--
-- Name: task_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_steps_id_seq OWNED BY public.task_steps.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    task_id integer NOT NULL,
    name character varying(100)
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_task_id_seq OWNER TO postgres;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_task_id_seq OWNED BY public.tasks.task_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    full_name character varying(100),
    email character varying(100),
    password_hash text,
    role_id bigint,
    department_id bigint,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: work_order_parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_parts (
    id integer NOT NULL,
    work_order_id integer,
    part_id integer,
    quantity integer
);


ALTER TABLE public.work_order_parts OWNER TO postgres;

--
-- Name: work_order_parts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_order_parts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_parts_id_seq OWNER TO postgres;

--
-- Name: work_order_parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_order_parts_id_seq OWNED BY public.work_order_parts.id;


--
-- Name: work_order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_status_history (
    id integer NOT NULL,
    work_order_id integer,
    old_status character varying(50),
    new_status character varying(50),
    changed_by integer,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    comment text
);


ALTER TABLE public.work_order_status_history OWNER TO postgres;

--
-- Name: work_order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_status_history_id_seq OWNER TO postgres;

--
-- Name: work_order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_order_status_history_id_seq OWNED BY public.work_order_status_history.id;


--
-- Name: work_order_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_tasks (
    id integer NOT NULL,
    work_order_id integer,
    task_id integer,
    status character varying(50)
);


ALTER TABLE public.work_order_tasks OWNER TO postgres;

--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_order_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_tasks_id_seq OWNER TO postgres;

--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_order_tasks_id_seq OWNED BY public.work_order_tasks.id;


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_orders (
    work_order_id integer NOT NULL,
    claim_id integer,
    technician_id integer,
    status character varying(50),
    priority character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estimated_time integer,
    actual_time integer,
    total_cost numeric,
    validated_by integer,
    validated_at timestamp without time zone
);


ALTER TABLE public.work_orders OWNER TO postgres;

--
-- Name: work_orders_work_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_orders_work_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_orders_work_order_id_seq OWNER TO postgres;

--
-- Name: work_orders_work_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_orders_work_order_id_seq OWNED BY public.work_orders.work_order_id;


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: claim_photos photo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_photos ALTER COLUMN photo_id SET DEFAULT nextval('public.claim_photos_photo_id_seq'::regclass);


--
-- Name: claim_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_status_history ALTER COLUMN id SET DEFAULT nextval('public.claim_status_history_id_seq'::regclass);


--
-- Name: claims claim_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims ALTER COLUMN claim_id SET DEFAULT nextval('public.claims_claim_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: equipment equipment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipment_equipment_id_seq'::regclass);


--
-- Name: equipment_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_documents ALTER COLUMN id SET DEFAULT nextval('public.equipment_documents_id_seq'::regclass);


--
-- Name: equipment_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_history ALTER COLUMN id SET DEFAULT nextval('public.equipment_history_id_seq'::regclass);


--
-- Name: failure_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failure_logs ALTER COLUMN id SET DEFAULT nextval('public.failure_logs_id_seq'::regclass);


--
-- Name: labor_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_logs ALTER COLUMN id SET DEFAULT nextval('public.labor_logs_id_seq'::regclass);


--
-- Name: maintenance_costs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_costs ALTER COLUMN id SET DEFAULT nextval('public.maintenance_costs_id_seq'::regclass);


--
-- Name: maintenance_plans plan_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.maintenance_plans_plan_id_seq'::regclass);


--
-- Name: meter_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_logs ALTER COLUMN log_id SET DEFAULT nextval('public.meter_logs_log_id_seq'::regclass);


--
-- Name: meter_thresholds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_thresholds ALTER COLUMN id SET DEFAULT nextval('public.meter_thresholds_id_seq'::regclass);


--
-- Name: meters meter_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meters ALTER COLUMN meter_id SET DEFAULT nextval('public.meters_meter_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: part_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_movements ALTER COLUMN id SET DEFAULT nextval('public.part_movements_id_seq'::regclass);


--
-- Name: parts part_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parts ALTER COLUMN part_id SET DEFAULT nextval('public.parts_part_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules ALTER COLUMN id SET DEFAULT nextval('public.schedules_id_seq'::regclass);


--
-- Name: task_steps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_steps ALTER COLUMN id SET DEFAULT nextval('public.task_steps_id_seq'::regclass);


--
-- Name: tasks task_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN task_id SET DEFAULT nextval('public.tasks_task_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: work_order_parts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_parts ALTER COLUMN id SET DEFAULT nextval('public.work_order_parts_id_seq'::regclass);


--
-- Name: work_order_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_status_history ALTER COLUMN id SET DEFAULT nextval('public.work_order_status_history_id_seq'::regclass);


--
-- Name: work_order_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_tasks ALTER COLUMN id SET DEFAULT nextval('public.work_order_tasks_id_seq'::regclass);


--
-- Name: work_orders work_order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders ALTER COLUMN work_order_id SET DEFAULT nextval('public.work_orders_work_order_id_seq'::regclass);


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerts (id, equipment_id, work_order_id, meter_id, alert_type, message, status, created_at) FROM stdin;
1	2	1	2	maintenance_due	X-Ray Machine has exceeded 95% of usage threshold.	open	2026-04-04 08:10:00
2	5	2	4	threshold_exceeded	Blood Analyzer meter exceeded threshold value.	open	2026-04-04 08:15:00
3	4	3	3	scheduled_service	Ventilator preventive service is scheduled soon.	closed	2026-04-04 08:20:00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action_type, entity_name, entity_id, action_details, created_at) FROM stdin;
1	1	LOGIN	auth	1	System Admin User logged in	2026-04-03 16:23:18.594782
2	3	LOGIN	auth	3	mohaimen aburas User logged in	2026-04-03 16:24:21.631041
3	1	LOGIN	auth	1	System Admin User logged in	2026-04-03 16:25:21.950487
4	\N	DELETE_USER	User	2	admin@hospital.com Deleted user account: johndoe@hospital.com	2026-04-03 16:25:29.073115
5	\N	UPDATE_USER	User	3	admin@hospital.com Updated user details for: mohaimen@gmail.com	2026-04-03 16:26:14.102705
6	\N	UPDATE_USER	User	1	admin@hospital.com Updated user details for: admin@hospital.com	2026-04-03 16:27:33.219581
7	4	CREATE_EQUIPMENT	Equipment	1	Sarah Mitchell registered MRI Scanner	2026-04-01 09:00:00
8	4	CREATE_WORK_ORDER	WorkOrder	1	Created work order for X-Ray overheating issue	2026-04-02 10:30:00
9	5	UPDATE_WORK_ORDER	WorkOrder	1	Technician reviewed and accepted assignment	2026-04-02 11:00:00
10	8	VALIDATE_WORK_ORDER	WorkOrder	2	Supervisor validated completed repair	2026-04-03 16:05:00
11	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:40:47.672787
12	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:41:32.720232
13	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:41:32.739094
14	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:41:35.742082
15	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:41:35.758065
16	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:41:51.165731
17	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:41:51.177352
18	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:41:51.878337
19	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:41:51.893862
20	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:45:26.959766
21	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:45:26.968863
22	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:45:28.746423
23	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:45:28.76131
24	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:53:05.31968
25	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 15:53:05.496175
26	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:25:41.709302
27	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:25:41.803092
28	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:29:59.873355
29	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:29:59.979174
30	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:30:01.547145
31	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:30:01.556882
32	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:30:01.972021
33	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:30:01.990821
34	\N	VIEW_REQUESTER_CLAIMS	REQUESTER	5	Viewed claims for requester 5 (count=0)	2026-04-04 16:31:23.980633
35	\N	VIEW_REQUESTER_CLAIMS	REQUESTER	1	Viewed claims for requester 1 (count=3)	2026-04-04 16:31:27.506362
36	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:31:29.03973
37	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:31:29.053225
38	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:31:31.605117
39	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:31:31.613857
40	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:31:36.627927
41	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:31:36.630005
42	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:31:36.703344
43	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:31:36.70442
44	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:33:24.300778
45	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:33:24.410324
46	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:33:25.886977
47	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:33:25.896185
48	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:33:26.990895
49	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:33:26.997059
50	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:33:27.007987
51	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:33:27.013387
52	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:35:32.40954
53	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:35:41.342509
54	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:36:13.208771
55	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:36:13.20977
56	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:36:13.20977
57	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:36:13.211827
58	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:36:13.217581
61	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:36:13.23031
59	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:36:13.23031
60	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:36:13.23031
62	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:36:33.506387
63	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:36:33.516325
64	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:36:35.657036
65	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:36:35.657036
66	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:36:35.657036
67	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:36:35.659039
68	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:36:35.664992
69	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:36:35.66632
70	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:36:35.66632
71	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:36:35.668895
72	\N	UPDATE_CLAIM	CLAIM	2	Updated claim 2	2026-04-04 16:37:06.843858
73	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:37:06.877892
74	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:37:06.878744
75	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:37:06.880269
76	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:37:06.881542
77	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:37:27.377833
78	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:37:27.390503
79	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:37:35.675601
82	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:37:35.68398
81	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:37:35.679074
83	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:37:35.698247
159	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:44:12.689145
160	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:44:12.726272
161	\N	VIEW_CLAIM	CLAIM	3	Viewed claim 3	2026-04-04 16:44:14.537727
162	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	3	Checked eligibility for claim 3: eligible=false	2026-04-04 16:44:14.540259
163	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	3	Viewed photos for claim 3 (count=0)	2026-04-04 16:44:14.541261
164	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	3	Viewed status history for claim 3 (count=0)	2026-04-04 16:44:14.541261
165	\N	VIEW_CLAIM	CLAIM	3	Viewed claim 3	2026-04-04 16:44:14.54845
166	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	3	Checked eligibility for claim 3: eligible=false	2026-04-04 16:44:14.54845
167	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	3	Viewed photos for claim 3 (count=0)	2026-04-04 16:44:14.548956
168	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	3	Viewed status history for claim 3 (count=0)	2026-04-04 16:44:14.549963
169	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	3	Checked eligibility for claim 3: eligible=false	2026-04-04 16:44:19.016183
170	\N	QUALIFY_CLAIM	CLAIM	3	Qualified claim 3 from open to QUALIFIED	2026-04-04 16:44:23.43682
171	\N	VIEW_CLAIM	CLAIM	3	Viewed claim 3	2026-04-04 16:44:23.453135
172	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	3	Viewed photos for claim 3 (count=0)	2026-04-04 16:44:23.45414
173	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	3	Viewed status history for claim 3 (count=1)	2026-04-04 16:44:23.45414
174	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	3	Checked eligibility for claim 3: eligible=true	2026-04-04 16:44:23.45514
175	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:48:11.401635
176	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:48:11.414298
177	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	6	Checked eligibility for claim 6: eligible=true	2026-04-04 16:48:26.98826
178	\N	VIEW_CLAIM	CLAIM	6	Viewed claim 6	2026-04-04 16:48:26.98826
179	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	6	Viewed status history for claim 6 (count=2)	2026-04-04 16:48:26.98826
180	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	6	Viewed photos for claim 6 (count=1)	2026-04-04 16:48:26.98926
181	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	6	Checked eligibility for claim 6: eligible=true	2026-04-04 16:48:26.993318
182	\N	VIEW_CLAIM	CLAIM	6	Viewed claim 6	2026-04-04 16:48:27.001495
183	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	6	Viewed photos for claim 6 (count=1)	2026-04-04 16:48:27.004026
184	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	6	Viewed status history for claim 6 (count=2)	2026-04-04 16:48:27.004026
185	\N	DELETE_CLAIM	CLAIM	6	Deleted claim 6	2026-04-04 16:48:29.378065
186	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:56:04.33105
187	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:56:16.53134
188	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:57:57.722527
189	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:57:58.072991
190	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:58:37.685138
191	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:58:37.732003
192	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	7	Checked eligibility for claim 7: eligible=false	2026-04-04 16:58:40.733797
193	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	7	Checked eligibility for claim 7: eligible=false	2026-04-04 16:58:40.757862
195	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	7	Viewed status history for claim 7 (count=1)	2026-04-04 16:58:41.365096
194	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	7	Viewed photos for claim 7 (count=0)	2026-04-04 16:58:41.364455
196	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	7	Viewed photos for claim 7 (count=0)	2026-04-04 16:58:41.393469
197	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	7	Viewed status history for claim 7 (count=1)	2026-04-04 16:58:41.393469
198	\N	PATCH_CLAIM_STATUS	CLAIM	7	Patched status of claim 7 from pending to CANCELLED	2026-04-04 16:58:52.003006
199	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	7	Checked eligibility for claim 7: eligible=false	2026-04-04 16:58:52.097727
200	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	7	Viewed photos for claim 7 (count=0)	2026-04-04 16:58:52.1053
201	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	7	Viewed status history for claim 7 (count=2)	2026-04-04 16:58:52.111015
202	\N	PATCH_CLAIM_STATUS	CLAIM	7	Patched status of claim 7 from CANCELLED to CANCELLED	2026-04-04 16:58:53.613554
203	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	7	Checked eligibility for claim 7: eligible=false	2026-04-04 16:58:53.692864
204	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	7	Viewed photos for claim 7 (count=0)	2026-04-04 16:58:53.698468
205	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	7	Viewed status history for claim 7 (count=3)	2026-04-04 16:58:53.701686
206	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 17:02:14.520071
207	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 17:02:14.581297
208	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:03:04.453566
209	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	4	Viewed photos for claim 4 (count=0)	2026-04-04 17:03:04.459902
210	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	4	Viewed status history for claim 4 (count=3)	2026-04-04 17:03:04.459902
211	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:03:04.469588
212	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	4	Viewed status history for claim 4 (count=3)	2026-04-04 17:03:04.479164
213	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	4	Viewed photos for claim 4 (count=0)	2026-04-04 17:03:04.483108
214	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:03:24.154456
215	\N	PATCH_CLAIM_STATUS	CLAIM	4	Patched status of claim 4 from new description to CREATED	2026-04-04 17:03:40.863422
216	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:03:40.91981
217	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	4	Viewed photos for claim 4 (count=0)	2026-04-04 17:03:40.923342
218	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	4	Viewed status history for claim 4 (count=4)	2026-04-04 17:03:40.925533
219	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:03:43.353509
220	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:05:37.443899
221	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:08:31.929745
222	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:08:34.377114
223	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	4	Checked eligibility for claim 4: eligible=false	2026-04-04 17:08:34.974096
224	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	4	Viewed photos for claim 4 (count=0)	2026-04-04 17:15:24.264997
226	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	4	Viewed photos for claim 4 (count=0)	2026-04-04 17:15:24.309575
80	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:37:35.6766
84	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:37:35.698247
86	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=1)	2026-04-04 16:37:35.699247
85	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:37:35.699247
87	\N	DELETE_CLAIM_PHOTO	CLAIM_PHOTO	2	Deleted photo 2 from claim 2	2026-04-04 16:37:58.995488
88	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:37:59.053863
89	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:37:59.053863
90	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:37:59.055079
91	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=0)	2026-04-04 16:37:59.055079
92	\N	UPDATE_CLAIM	CLAIM	2	Updated claim 2	2026-04-04 16:38:08.237581
93	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:38:08.248818
96	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:38:08.250315
94	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:38:08.248818
95	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=0)	2026-04-04 16:38:08.250315
97	\N	DELETE_CLAIM	CLAIM	2	Deleted claim 2	2026-04-04 16:38:16.239437
98	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:38:20.029732
99	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:38:20.041837
100	\N	VIEW_EQUIPMENT_CLAIMS	EQUIPMENT	4	Viewed claims for equipment 4 (count=3)	2026-04-04 16:39:32.840399
101	\N	VIEW_REQUESTER_CLAIMS	REQUESTER	1	Viewed claims for requester 1 (count=3)	2026-04-04 16:39:37.766026
102	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:39:46.863364
103	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:39:46.907574
104	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:39:50.150158
105	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:39:50.151664
106	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:39:50.151664
107	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=0)	2026-04-04 16:39:50.15318
108	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:39:50.159699
109	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:39:50.160206
110	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:39:50.160206
111	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=0)	2026-04-04 16:39:50.161209
112	\N	DELETE_CLAIM	CLAIM	2	Deleted claim 2	2026-04-04 16:39:53.825531
113	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:39:55.848233
114	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:39:55.891435
115	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:40:03.090065
116	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:40:03.134228
117	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:40:05.251948
118	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:40:05.251948
119	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=0)	2026-04-04 16:40:05.253597
120	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:40:05.253597
121	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:40:05.259599
122	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:40:05.259599
123	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=0)	2026-04-04 16:40:05.26082
124	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:40:05.263312
125	\N	DELETE_CLAIM	CLAIM	2	Deleted claim 2	2026-04-04 16:40:09.259725
126	\N	DELETE_CLAIM	CLAIM	2	Deleted claim 2	2026-04-04 16:41:48.781714
127	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:42:18.909696
128	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:42:18.911697
129	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	2	Checked eligibility for claim 2: eligible=false	2026-04-04 16:42:18.925227
130	\N	VIEW_CLAIM	CLAIM	2	Viewed claim 2	2026-04-04 16:42:18.926226
131	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=0)	2026-04-04 16:42:19.156031
132	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:42:19.156031
133	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	2	Viewed photos for claim 2 (count=0)	2026-04-04 16:42:19.16921
134	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	2	Viewed status history for claim 2 (count=1)	2026-04-04 16:42:19.172773
135	\N	DELETE_CLAIM	CLAIM	2	Deleted claim 2	2026-04-04 16:42:22.671201
136	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:42:31.980669
137	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:42:32.027726
138	\N	VIEW_CLAIM	CLAIM	3	Viewed claim 3	2026-04-04 16:42:34.90663
139	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	3	Checked eligibility for claim 3: eligible=false	2026-04-04 16:42:34.90663
140	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	3	Viewed status history for claim 3 (count=0)	2026-04-04 16:42:34.908825
141	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	3	Viewed photos for claim 3 (count=0)	2026-04-04 16:42:34.911197
142	\N	VIEW_CLAIM	CLAIM	3	Viewed claim 3	2026-04-04 16:42:34.914937
143	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	3	Checked eligibility for claim 3: eligible=false	2026-04-04 16:42:34.914937
144	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	3	Viewed photos for claim 3 (count=0)	2026-04-04 16:42:34.920467
145	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	3	Viewed status history for claim 3 (count=0)	2026-04-04 16:42:34.920467
146	\N	DELETE_CLAIM	CLAIM	3	Deleted claim 3	2026-04-04 16:42:36.858302
147	\N	CREATE_CLAIM	CLAIM	9	Created claim for requester 1 on equipment 4	2026-04-04 16:43:32.743056
148	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	9	Viewed photos for claim 9 (count=0)	2026-04-04 16:43:32.764567
150	\N	VIEW_CLAIM	CLAIM	9	Viewed claim 9	2026-04-04 16:43:32.764567
149	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	9	Checked eligibility for claim 9: eligible=false	2026-04-04 16:43:32.764567
151	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	9	Viewed status history for claim 9 (count=1)	2026-04-04 16:43:32.765771
152	\N	CHECK_CLAIM_ELIGIBILITY	CLAIM_ELIGIBILITY	9	Checked eligibility for claim 9: eligible=false	2026-04-04 16:43:32.773225
153	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	9	Viewed photos for claim 9 (count=0)	2026-04-04 16:43:32.775723
154	\N	VIEW_CLAIM	CLAIM	9	Viewed claim 9	2026-04-04 16:43:32.779054
155	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	9	Viewed status history for claim 9 (count=1)	2026-04-04 16:43:32.780859
156	\N	DELETE_CLAIM	CLAIM	9	Deleted claim 9	2026-04-04 16:43:47.223864
157	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:43:47.278912
158	\N	VIEW_ALL_CLAIMS	CLAIM	\N	Viewed all claims (count=7)	2026-04-04 16:43:47.290081
225	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	4	Viewed status history for claim 4 (count=4)	2026-04-04 17:15:24.264997
227	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	4	Viewed status history for claim 4 (count=4)	2026-04-04 17:15:24.309575
228	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	4	Viewed photos for claim 4 (count=0)	2026-04-04 17:17:24.968089
229	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	4	Viewed status history for claim 4 (count=4)	2026-04-04 17:17:24.968089
230	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	4	Viewed status history for claim 4 (count=4)	2026-04-04 17:17:25.090175
231	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	4	Viewed photos for claim 4 (count=0)	2026-04-04 17:17:25.092682
232	\N	PATCH_CLAIM_STATUS	CLAIM	4	Patched status of claim 4 from CREATED to CANCELLED	2026-04-04 17:17:37.953557
233	\N	VIEW_CLAIM_STATUS_HISTORY	CLAIM_STATUS_HISTORY	4	Viewed status history for claim 4 (count=5)	2026-04-04 17:17:38.06798
234	\N	VIEW_CLAIM_PHOTOS	CLAIM_PHOTO	4	Viewed photos for claim 4 (count=0)	2026-04-04 17:17:38.069492
235	1	LOGIN	auth	1	Admin User logged in	2026-04-06 16:44:39.572335
236	1	LOGIN	auth	1	Admin User logged in	2026-04-06 17:39:35.026438
237	\N	CREATE_USER	User	10	admin@hospital.com Created user: Gacha@gmail.com	2026-04-06 17:41:21.257755
238	10	LOGIN	auth	10	Ayoub Bougacha User logged in	2026-04-06 17:41:41.349531
\.


--
-- Data for Name: claim_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.claim_photos (photo_id, claim_id, photo_url) FROM stdin;
1	1	https://example.com/photos/xray_overheat_1.jpg
3	6	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjbLBjnI2Oj22syh3lCjtvk7R4bvwPCKxRkw&s
4	1	string
\.


--
-- Data for Name: claim_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.claim_status_history (id, claim_id, old_status, new_status, changed_at, reason) FROM stdin;
1	1	open	approved	2026-04-02 10:00:00	\N
2	2	open	in_progress	2026-04-02 11:30:00	\N
3	4	\N	CREATED	2026-04-04 02:57:46.072028	\N
5	6	\N	CREATED	2026-04-04 03:07:05.480231	\N
6	6	CREATED	QUALIFIED	2026-04-04 03:09:06.302784	\N
7	4	CREATED	QUALIFIED	2026-04-04 03:10:55.783298	\N
8	4	QUALIFIED	new description	2026-04-04 15:02:39.032198	\N
9	7	\N	pending	2026-04-04 15:03:51.010581	\N
10	8	\N	pending	2026-04-04 15:04:00.766622	\N
11	8	pending	QUALIFIED	2026-04-04 15:05:42.435753	\N
12	8	QUALIFIED	pending	2026-04-04 15:07:49.555802	\N
14	3	open	QUALIFIED	2026-04-04 16:44:23.432961	\N
15	7	pending	CANCELLED	2026-04-04 16:58:51.993414	\N
16	7	CANCELLED	CANCELLED	2026-04-04 16:58:53.613554	\N
17	4	new description	CREATED	2026-04-04 17:03:40.863422	\N
18	4	CREATED	CANCELLED	2026-04-04 17:17:37.943103	no valid thing
\.


--
-- Data for Name: claims; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.claims (claim_id, requester_id, equipment_id, description, status, created_at) FROM stdin;
6	7	1	azeaeae	QUALIFIED	2026-04-04 03:07:05.478928
8	1	4	this is so new 	pending	2026-04-04 15:04:00.766622
1	7	2	X-Ray machine is overheating during long usage. qd	approved	2026-04-02 08:20:00
2	7	5	Blood analyzer displays inconsistent sample results. thisis new	in_progress	2026-04-02 09:10:00
3	1	4	Ventilator preventive service requested before next ICU rotation.	QUALIFIED	2026-04-03 10:00:00
7	1	4	something is wrong	CANCELLED	2026-04-04 15:03:51.008448
4	8	1	z;ezerzer	CANCELLED	2026-04-04 02:57:45.998488
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, department_name) FROM stdin;
1	IT Department
2	CLEANING_STAFF
3	RADIOLOGY
4	LABORATORY
5	BIOMEDICAL
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (equipment_id, name, serial_number, status, location, department_id, created_at) FROM stdin;
1	MRI Scanner	MRI-2026-001	active	Radiology Room A	3	2026-04-01 09:00:00
2	X-Ray Machine	XR-2026-014	maintenance	Radiology Room B	3	2026-04-01 09:10:00
3	Ultrasound Unit	US-2026-008	active	Emergency Unit	1	2026-04-01 09:20:00
4	Ventilator	VEN-2026-022	active	ICU Ward	1	2026-04-01 09:30:00
5	Blood Analyzer	LAB-2026-031	inactive	Lab Room 2	4	2026-04-01 09:40:00
\.


--
-- Data for Name: equipment_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_documents (id, equipment_id, document_name, file_path, content_type, file_size) FROM stdin;
1	1	MRI Maintenance Manual.pdf	/docs/equipment/mri_manual.pdf	\N	\N
2	2	X-Ray Calibration Sheet.pdf	/docs/equipment/xray_calibration.pdf	\N	\N
3	4	Ventilator SOP.pdf	/docs/equipment/ventilator_sop.pdf	\N	\N
\.


--
-- Data for Name: equipment_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_history (id, equipment_id, action, performed_by, created_at) FROM stdin;
1	1	Equipment registered in system	4	2026-04-01 10:00:00
2	2	Marked for maintenance inspection	4	2026-04-02 11:15:00
3	5	Temporarily deactivated after abnormal readings	8	2026-04-02 13:40:00
\.


--
-- Data for Name: failure_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failure_logs (id, equipment_id, work_order_id, description, created_at) FROM stdin;
1	2	1	Cooling system failed after 3 continuous hours of operation.	2026-04-02 10:45:00
2	5	2	Analyzer returned repeated calibration mismatch errors.	2026-04-02 12:20:00
3	2	1	eaeaze	2026-04-04 03:31:25.307441
\.


--
-- Data for Name: labor_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.labor_logs (id, work_order_id, technician_id, start_time, end_time, hours_spent, notes) FROM stdin;
1	2	6	2026-04-03 13:00:00	2026-04-03 15:00:00	2.00	Initial diagnostics and recalibration completed.
2	1	5	2026-04-04 03:26:00	2026-04-05 03:26:00	24.00	\N
\.


--
-- Data for Name: maintenance_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_costs (id, work_order_id, labor_cost, parts_cost, external_cost) FROM stdin;
1	1	120.00	45.00	0.00
2	2	160.00	100.00	0.00
3	3	90.00	0.00	0.00
\.


--
-- Data for Name: maintenance_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_plans (plan_id, equipment_id, frequency, interval_unit, interval_value, last_performed_at, name, next_due_at, status, technician_name) FROM stdin;
1	1	monthly	\N	\N	\N	\N	\N	\N	\N
2	2	weekly	\N	\N	\N	\N	\N	\N	\N
3	3	quarterly	\N	\N	\N	\N	\N	\N	\N
4	4	monthly	\N	\N	\N	\N	\N	\N	\N
5	5	weekly	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: meter_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meter_logs (log_id, meter_id, value, recorded_at) FROM stdin;
1	1	1180	2026-04-01 08:00:00
2	1	1240	2026-04-04 08:00:00
3	2	830	2026-04-01 08:00:00
4	2	860	2026-04-04 08:00:00
5	3	4000	2026-04-01 08:00:00
6	3	4200	2026-04-04 08:00:00
7	4	280	2026-04-01 08:00:00
8	4	310	2026-04-04 08:00:00
\.


--
-- Data for Name: meter_thresholds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meter_thresholds (id, meter_id, threshold_value) FROM stdin;
1	1	1500
2	2	900
3	3	5000
4	4	400
\.


--
-- Data for Name: meters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meters (meter_id, equipment_id, value, meter_type, last_reading_at, name, unit) FROM stdin;
1	1	1240	hours	\N	\N	\N
2	2	860	hours	\N	\N	\N
3	4	4200	cycles	\N	\N	\N
4	5	310	hours	\N	\N	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, is_read, created_at) FROM stdin;
1	4	New Work Order Assigned	A new work order #1 has been created and assigned.	f	2026-04-02 10:40:00
2	5	Scheduled Maintenance	You are scheduled for work order #1 on 2026-04-05.	f	2026-04-04 09:00:00
3	6	Calibration In Progress	Work order #2 requires calibration follow-up.	t	2026-04-03 14:00:00
4	8	Validation Required	Work order #2 is ready for final validation.	f	2026-04-03 15:30:00
\.


--
-- Data for Name: part_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.part_movements (id, part_id, quantity, movement_type, created_at) FROM stdin;
1	1	5	IN	2026-04-04 01:41:01.745535
2	2	10	IN	2026-04-02 09:00:00
3	3	5	IN	2026-04-02 09:10:00
4	4	15	IN	2026-04-02 09:20:00
5	5	8	IN	2026-04-02 09:30:00
6	2	1	OUT	2026-04-03 14:45:00
7	3	1	OUT	2026-04-03 15:10:00
8	4	10	IN	2026-04-04 03:17:44.984835
\.


--
-- Data for Name: parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parts (part_id, name, stock_quantity, min_stock, unit_cost) FROM stdin;
2	Cooling Fan	12	4	45.00
3	Circuit Board	6	2	180.00
5	Sensor Kit	9	3	75.00
1	bouji	15	6	20.00
4	Pressure Valve	30	8	32.50
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name) FROM stdin;
1	ADMIN
2	FINANCE_MANAGER
3	MAINTENANCE_MANAGER
4	TECHNICIAN
5	HOSPITAL_STAFF
6	DOCTOR
7	SUPERVISOR
8	INVENTORY_MANAGER
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedules (id, work_order_id, technician_id, planned_date, start_time, end_time) FROM stdin;
1	1	5	2026-04-05	09:00:00	13:00:00
2	2	6	2026-04-05	14:00:00	17:00:00
3	3	5	2026-04-06	10:00:00	12:00:00
\.


--
-- Data for Name: task_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_steps (id, task_id, step_name, status) FROM stdin;
1	1	Visual inspection of unit exterior	done
2	1	Check error logs	done
3	2	Remove damaged cooling fan	pending
4	3	Run system calibration routine	in_progress
5	4	Perform operational safety checks	pending
6	5	Manager approval	pending
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (task_id, name) FROM stdin;
1	Initial Inspection
2	Replace Faulty Part
3	Calibration
4	Safety Test
5	Final Validation
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, full_name, email, password_hash, role_id, department_id, is_active, created_at) FROM stdin;
3	mohaimen ibrahim aburas	mohaimen@gmail.com	$2a$10$VoyM/8gjQArUnDFTSHxtX.ZpoH0va1Y7poNKjRR6E96l1kR424AYu	4	1	t	2026-04-03 15:45:23.770864
1	Admin	admin@hospital.com	$2a$10$2Z1A05NDY.7IuxJS29QjQOvTvfphzpfoHo2t5M1qZ.U7LZd5eJ6pO	1	1	t	2026-04-03 01:25:13.467473
4	Sarah Mitchell	sarah.mitchell@hospital.com	$2a$10$fakehash001	3	5	t	2026-04-01 08:15:00
5	David Carter	david.carter@hospital.com	$2a$10$fakehash002	4	5	t	2026-04-01 08:20:00
6	Emma Wilson	emma.wilson@hospital.com	$2a$10$fakehash003	4	3	t	2026-04-01 08:25:00
7	Michael Brown	michael.brown@hospital.com	$2a$10$fakehash004	5	4	t	2026-04-01 08:30:00
8	Olivia Taylor	olivia.taylor@hospital.com	$2a$10$fakehash005	7	1	t	2026-04-01 08:35:00
9	Noah Anderson	noah.anderson@hospital.com	$2a$10$fakehash006	8	1	t	2026-04-01 08:40:00
10	Ayoub Bougacha	Gacha@gmail.com	$2a$10$eZaQpxYq11.nAWK2UpWkWeQvgrXs7RFnWdPIjCJBnWBf0RE/0WahO	3	1	t	2026-04-06 17:41:21.253916
\.


--
-- Data for Name: work_order_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_parts (id, work_order_id, part_id, quantity) FROM stdin;
1	1	2	1
2	2	3	1
3	2	5	1
\.


--
-- Data for Name: work_order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_status_history (id, work_order_id, old_status, new_status, changed_by, changed_at, comment) FROM stdin;
1	1	open	assigned	4	2026-04-02 10:35:00	Assigned to technician David Carter
2	2	open	in_progress	4	2026-04-02 12:05:00	Work started after diagnostics
3	2	in_progress	validated	8	2026-04-03 16:00:00	Repair and calibration verified
4	4	\N	CREATED	\N	2026-04-04 03:25:27.844951	Created from claim
8	1	ASSIGNED	CANCELLED	1	2026-04-04 03:30:48.55539	\N
\.


--
-- Data for Name: work_order_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_tasks (id, work_order_id, task_id, status) FROM stdin;
1	1	1	done
2	1	2	pending
3	1	4	pending
4	2	1	done
5	2	3	in_progress
6	2	5	pending
7	3	1	pending
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_orders (work_order_id, claim_id, technician_id, status, priority, created_at, estimated_time, actual_time, total_cost, validated_by, validated_at) FROM stdin;
2	2	6	in_progress	medium	2026-04-02 12:00:00	6	2	260.00	8	2026-04-03 16:00:00
3	3	5	open	low	2026-04-03 10:30:00	3	\N	\N	\N	\N
4	6	\N	CREATED	\N	2026-04-04 03:25:27.821964	\N	\N	\N	\N	\N
1	1	5	CANCELLED	high	2026-04-02 10:30:00	4	24	\N	\N	\N
\.


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerts_id_seq', 3, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 238, true);


--
-- Name: claim_photos_photo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.claim_photos_photo_id_seq', 4, true);


--
-- Name: claim_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.claim_status_history_id_seq', 18, true);


--
-- Name: claims_claim_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.claims_claim_id_seq', 9, true);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 5, true);


--
-- Name: equipment_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_documents_id_seq', 3, true);


--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_equipment_id_seq', 5, true);


--
-- Name: equipment_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_history_id_seq', 3, true);


--
-- Name: failure_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failure_logs_id_seq', 3, true);


--
-- Name: labor_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.labor_logs_id_seq', 2, true);


--
-- Name: maintenance_costs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_costs_id_seq', 3, true);


--
-- Name: maintenance_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_plans_plan_id_seq', 5, true);


--
-- Name: meter_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meter_logs_log_id_seq', 8, true);


--
-- Name: meter_thresholds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meter_thresholds_id_seq', 4, true);


--
-- Name: meters_meter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meters_meter_id_seq', 4, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 4, true);


--
-- Name: part_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.part_movements_id_seq', 8, true);


--
-- Name: parts_part_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parts_part_id_seq', 5, true);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 8, true);


--
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedules_id_seq', 3, true);


--
-- Name: task_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_steps_id_seq', 6, true);


--
-- Name: tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_task_id_seq', 5, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 10, true);


--
-- Name: work_order_parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_order_parts_id_seq', 3, true);


--
-- Name: work_order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_order_status_history_id_seq', 8, true);


--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_order_tasks_id_seq', 7, true);


--
-- Name: work_orders_work_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_orders_work_order_id_seq', 4, true);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: claim_photos claim_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_photos
    ADD CONSTRAINT claim_photos_pkey PRIMARY KEY (photo_id);


--
-- Name: claim_status_history claim_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_status_history
    ADD CONSTRAINT claim_status_history_pkey PRIMARY KEY (id);


--
-- Name: claims claims_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_pkey PRIMARY KEY (claim_id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: equipment_documents equipment_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_documents
    ADD CONSTRAINT equipment_documents_pkey PRIMARY KEY (id);


--
-- Name: equipment_history equipment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_history
    ADD CONSTRAINT equipment_history_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- Name: failure_logs failure_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failure_logs
    ADD CONSTRAINT failure_logs_pkey PRIMARY KEY (id);


--
-- Name: labor_logs labor_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_logs
    ADD CONSTRAINT labor_logs_pkey PRIMARY KEY (id);


--
-- Name: maintenance_costs maintenance_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_costs
    ADD CONSTRAINT maintenance_costs_pkey PRIMARY KEY (id);


--
-- Name: maintenance_plans maintenance_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_plans
    ADD CONSTRAINT maintenance_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: meter_logs meter_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_logs
    ADD CONSTRAINT meter_logs_pkey PRIMARY KEY (log_id);


--
-- Name: meter_thresholds meter_thresholds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_thresholds
    ADD CONSTRAINT meter_thresholds_pkey PRIMARY KEY (id);


--
-- Name: meters meters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meters
    ADD CONSTRAINT meters_pkey PRIMARY KEY (meter_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: part_movements part_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_movements
    ADD CONSTRAINT part_movements_pkey PRIMARY KEY (id);


--
-- Name: parts parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_pkey PRIMARY KEY (part_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: task_steps task_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_steps
    ADD CONSTRAINT task_steps_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: work_order_parts work_order_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_parts
    ADD CONSTRAINT work_order_parts_pkey PRIMARY KEY (id);


--
-- Name: work_order_status_history work_order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_status_history
    ADD CONSTRAINT work_order_status_history_pkey PRIMARY KEY (id);


--
-- Name: work_order_tasks work_order_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (work_order_id);


--
-- Name: alerts alerts_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: alerts alerts_meter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);


--
-- Name: alerts alerts_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: claim_photos claim_photos_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_photos
    ADD CONSTRAINT claim_photos_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES public.claims(claim_id);


--
-- Name: claim_status_history claim_status_history_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_status_history
    ADD CONSTRAINT claim_status_history_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES public.claims(claim_id);


--
-- Name: claims claims_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: claims claims_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(user_id);


--
-- Name: equipment equipment_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: equipment_documents equipment_documents_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_documents
    ADD CONSTRAINT equipment_documents_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: equipment_history equipment_history_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_history
    ADD CONSTRAINT equipment_history_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: failure_logs failure_logs_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failure_logs
    ADD CONSTRAINT failure_logs_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: failure_logs failure_logs_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failure_logs
    ADD CONSTRAINT failure_logs_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: equipment_history fk_equipment_history_performed_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_history
    ADD CONSTRAINT fk_equipment_history_performed_by FOREIGN KEY (performed_by) REFERENCES public.users(user_id);


--
-- Name: work_orders fk_work_orders_validated_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT fk_work_orders_validated_by FOREIGN KEY (validated_by) REFERENCES public.users(user_id);


--
-- Name: labor_logs labor_logs_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_logs
    ADD CONSTRAINT labor_logs_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);


--
-- Name: labor_logs labor_logs_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.labor_logs
    ADD CONSTRAINT labor_logs_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: maintenance_costs maintenance_costs_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_costs
    ADD CONSTRAINT maintenance_costs_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: maintenance_plans maintenance_plans_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_plans
    ADD CONSTRAINT maintenance_plans_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: meter_logs meter_logs_meter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_logs
    ADD CONSTRAINT meter_logs_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);


--
-- Name: meter_thresholds meter_thresholds_meter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_thresholds
    ADD CONSTRAINT meter_thresholds_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);


--
-- Name: meters meters_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meters
    ADD CONSTRAINT meters_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: part_movements part_movements_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_movements
    ADD CONSTRAINT part_movements_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(part_id);


--
-- Name: schedules schedules_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);


--
-- Name: schedules schedules_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: task_steps task_steps_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_steps
    ADD CONSTRAINT task_steps_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: work_order_parts work_order_parts_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_parts
    ADD CONSTRAINT work_order_parts_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(part_id);


--
-- Name: work_order_parts work_order_parts_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_parts
    ADD CONSTRAINT work_order_parts_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: work_order_status_history work_order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_status_history
    ADD CONSTRAINT work_order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id);


--
-- Name: work_order_status_history work_order_status_history_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_status_history
    ADD CONSTRAINT work_order_status_history_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: work_order_tasks work_order_tasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id);


--
-- Name: work_order_tasks work_order_tasks_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: work_orders work_orders_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES public.claims(claim_id);


--
-- Name: work_orders work_orders_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict tQfYA6EfCNIuiadvPfv3GA0NSliba1HoXfC6LY3RjfVSrYNkDltOv2A2FFmt2zE

