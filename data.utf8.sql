--
-- PostgreSQL database dump
--

\restrict MrgNGUtDdWD9s5bXmyIMIbIiPzQ1iyHmHIa9yKN11TIG4r0RAuQfOJYwHep3ZK6

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: mohaimen
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


ALTER TABLE public.alerts OWNER TO mohaimen;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO mohaimen;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action_type character varying(100),
    entity_name character varying(100),
    entity_id integer,
    action_details text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO mohaimen;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO mohaimen;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: claim_photos; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.claim_photos (
    photo_id integer NOT NULL,
    claim_id integer,
    photo_url text
);


ALTER TABLE public.claim_photos OWNER TO mohaimen;

--
-- Name: claim_photos_photo_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.claim_photos_photo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claim_photos_photo_id_seq OWNER TO mohaimen;

--
-- Name: claim_photos_photo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.claim_photos_photo_id_seq OWNED BY public.claim_photos.photo_id;


--
-- Name: claim_status_history; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.claim_status_history (
    id integer NOT NULL,
    claim_id integer,
    old_status character varying(50),
    new_status character varying(50),
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.claim_status_history OWNER TO mohaimen;

--
-- Name: claim_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.claim_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claim_status_history_id_seq OWNER TO mohaimen;

--
-- Name: claim_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.claim_status_history_id_seq OWNED BY public.claim_status_history.id;


--
-- Name: claims; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.claims (
    claim_id integer NOT NULL,
    requester_id integer,
    equipment_id integer,
    description text,
    status character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.claims OWNER TO mohaimen;

--
-- Name: claims_claim_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.claims_claim_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claims_claim_id_seq OWNER TO mohaimen;

--
-- Name: claims_claim_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.claims_claim_id_seq OWNED BY public.claims.claim_id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(100) NOT NULL
);


ALTER TABLE public.departments OWNER TO mohaimen;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO mohaimen;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.equipment (
    equipment_id integer NOT NULL,
    name character varying(100),
    serial_number character varying(100),
    status character varying(50),
    location character varying(100),
    department_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    manufacturer character varying(255),
    model_reference character varying(255),
    classification character varying(255),
    criticality character varying(255),
    purchase_date date,
    commissioning_date date,
    supplier_name character varying(255),
    contract_number character varying(255),
    warranty_end_date date
);


ALTER TABLE public.equipment OWNER TO mohaimen;

--
-- Name: equipment_documents; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.equipment_documents (
    id integer NOT NULL,
    equipment_id integer,
    document_name text,
    file_path text,
    file_size bigint,
    content_type character varying(255),
    uploaded_at timestamp without time zone,
    uploaded_by character varying(255)
);


ALTER TABLE public.equipment_documents OWNER TO mohaimen;

--
-- Name: equipment_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.equipment_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_documents_id_seq OWNER TO mohaimen;

--
-- Name: equipment_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.equipment_documents_id_seq OWNED BY public.equipment_documents.id;


--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.equipment_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_equipment_id_seq OWNER TO mohaimen;

--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.equipment_equipment_id_seq OWNED BY public.equipment.equipment_id;


--
-- Name: equipment_history; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.equipment_history (
    id integer NOT NULL,
    equipment_id integer,
    action text,
    performed_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment_history OWNER TO mohaimen;

--
-- Name: equipment_history_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.equipment_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_history_id_seq OWNER TO mohaimen;

--
-- Name: equipment_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.equipment_history_id_seq OWNED BY public.equipment_history.id;


--
-- Name: failure_logs; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.failure_logs (
    id integer NOT NULL,
    equipment_id integer,
    work_order_id integer,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.failure_logs OWNER TO mohaimen;

--
-- Name: failure_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.failure_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failure_logs_id_seq OWNER TO mohaimen;

--
-- Name: failure_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.failure_logs_id_seq OWNED BY public.failure_logs.id;


--
-- Name: labor_logs; Type: TABLE; Schema: public; Owner: mohaimen
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


ALTER TABLE public.labor_logs OWNER TO mohaimen;

--
-- Name: labor_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.labor_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.labor_logs_id_seq OWNER TO mohaimen;

--
-- Name: labor_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.labor_logs_id_seq OWNED BY public.labor_logs.id;


--
-- Name: maintenance_costs; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.maintenance_costs (
    id integer NOT NULL,
    work_order_id integer,
    labor_cost numeric(12,2) DEFAULT 0,
    parts_cost numeric(12,2) DEFAULT 0,
    external_cost numeric(12,2) DEFAULT 0,
    total_cost numeric(12,2) GENERATED ALWAYS AS (((labor_cost + parts_cost) + external_cost)) STORED
);


ALTER TABLE public.maintenance_costs OWNER TO mohaimen;

--
-- Name: maintenance_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.maintenance_costs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_costs_id_seq OWNER TO mohaimen;

--
-- Name: maintenance_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.maintenance_costs_id_seq OWNED BY public.maintenance_costs.id;


--
-- Name: maintenance_plans; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.maintenance_plans (
    plan_id integer NOT NULL,
    equipment_id integer,
    frequency character varying(50),
    name character varying(255),
    interval_value integer,
    interval_unit character varying(50),
    status character varying(50),
    technician_name character varying(255),
    last_performed_at timestamp without time zone,
    next_due_at timestamp without time zone
);


ALTER TABLE public.maintenance_plans OWNER TO mohaimen;

--
-- Name: maintenance_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.maintenance_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_plans_plan_id_seq OWNER TO mohaimen;

--
-- Name: maintenance_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.maintenance_plans_plan_id_seq OWNED BY public.maintenance_plans.plan_id;


--
-- Name: meter_logs; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.meter_logs (
    log_id integer NOT NULL,
    meter_id integer,
    value integer,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.meter_logs OWNER TO mohaimen;

--
-- Name: meter_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.meter_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meter_logs_log_id_seq OWNER TO mohaimen;

--
-- Name: meter_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.meter_logs_log_id_seq OWNED BY public.meter_logs.log_id;


--
-- Name: meter_thresholds; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.meter_thresholds (
    id integer NOT NULL,
    meter_id integer,
    threshold_value integer
);


ALTER TABLE public.meter_thresholds OWNER TO mohaimen;

--
-- Name: meter_thresholds_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.meter_thresholds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meter_thresholds_id_seq OWNER TO mohaimen;

--
-- Name: meter_thresholds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.meter_thresholds_id_seq OWNED BY public.meter_thresholds.id;


--
-- Name: meters; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.meters (
    meter_id integer NOT NULL,
    equipment_id integer,
    value integer,
    meter_type character varying(50),
    name character varying(255),
    unit character varying(50),
    last_reading_at timestamp without time zone
);


ALTER TABLE public.meters OWNER TO mohaimen;

--
-- Name: meters_meter_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.meters_meter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meters_meter_id_seq OWNER TO mohaimen;

--
-- Name: meters_meter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.meters_meter_id_seq OWNED BY public.meters.meter_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying(150),
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO mohaimen;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO mohaimen;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: part_movements; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.part_movements (
    id integer NOT NULL,
    part_id integer,
    quantity integer,
    movement_type character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.part_movements OWNER TO mohaimen;

--
-- Name: part_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.part_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.part_movements_id_seq OWNER TO mohaimen;

--
-- Name: part_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.part_movements_id_seq OWNED BY public.part_movements.id;


--
-- Name: parts; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.parts (
    part_id integer NOT NULL,
    name character varying(100),
    stock_quantity integer,
    min_stock integer,
    unit_cost numeric(10,2)
);


ALTER TABLE public.parts OWNER TO mohaimen;

--
-- Name: parts_part_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.parts_part_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parts_part_id_seq OWNER TO mohaimen;

--
-- Name: parts_part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.parts_part_id_seq OWNED BY public.parts.part_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO mohaimen;

--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_role_id_seq OWNER TO mohaimen;

--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.schedules (
    id integer NOT NULL,
    work_order_id integer,
    technician_id integer,
    planned_date date,
    start_time time without time zone,
    end_time time without time zone
);


ALTER TABLE public.schedules OWNER TO mohaimen;

--
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedules_id_seq OWNER TO mohaimen;

--
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.schedules_id_seq OWNED BY public.schedules.id;


--
-- Name: task_steps; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.task_steps (
    id integer NOT NULL,
    task_id integer,
    step_name text,
    status character varying(50)
);


ALTER TABLE public.task_steps OWNER TO mohaimen;

--
-- Name: task_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.task_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_steps_id_seq OWNER TO mohaimen;

--
-- Name: task_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.task_steps_id_seq OWNED BY public.task_steps.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.tasks (
    task_id integer NOT NULL,
    name character varying(100)
);


ALTER TABLE public.tasks OWNER TO mohaimen;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_task_id_seq OWNER TO mohaimen;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.tasks_task_id_seq OWNED BY public.tasks.task_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    full_name character varying(100),
    email character varying(100),
    password_hash text,
    role_id integer,
    department_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO mohaimen;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO mohaimen;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: work_order_parts; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.work_order_parts (
    id integer NOT NULL,
    work_order_id integer,
    part_id integer,
    quantity integer
);


ALTER TABLE public.work_order_parts OWNER TO mohaimen;

--
-- Name: work_order_parts_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.work_order_parts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_parts_id_seq OWNER TO mohaimen;

--
-- Name: work_order_parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.work_order_parts_id_seq OWNED BY public.work_order_parts.id;


--
-- Name: work_order_status_history; Type: TABLE; Schema: public; Owner: mohaimen
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


ALTER TABLE public.work_order_status_history OWNER TO mohaimen;

--
-- Name: work_order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.work_order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_status_history_id_seq OWNER TO mohaimen;

--
-- Name: work_order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.work_order_status_history_id_seq OWNED BY public.work_order_status_history.id;


--
-- Name: work_order_tasks; Type: TABLE; Schema: public; Owner: mohaimen
--

CREATE TABLE public.work_order_tasks (
    id integer NOT NULL,
    work_order_id integer,
    task_id integer,
    status character varying(50)
);


ALTER TABLE public.work_order_tasks OWNER TO mohaimen;

--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.work_order_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_tasks_id_seq OWNER TO mohaimen;

--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.work_order_tasks_id_seq OWNED BY public.work_order_tasks.id;


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: mohaimen
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


ALTER TABLE public.work_orders OWNER TO mohaimen;

--
-- Name: work_orders_work_order_id_seq; Type: SEQUENCE; Schema: public; Owner: mohaimen
--

CREATE SEQUENCE public.work_orders_work_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_orders_work_order_id_seq OWNER TO mohaimen;

--
-- Name: work_orders_work_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mohaimen
--

ALTER SEQUENCE public.work_orders_work_order_id_seq OWNED BY public.work_orders.work_order_id;


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: claim_photos photo_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claim_photos ALTER COLUMN photo_id SET DEFAULT nextval('public.claim_photos_photo_id_seq'::regclass);


--
-- Name: claim_status_history id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claim_status_history ALTER COLUMN id SET DEFAULT nextval('public.claim_status_history_id_seq'::regclass);


--
-- Name: claims claim_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claims ALTER COLUMN claim_id SET DEFAULT nextval('public.claims_claim_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: equipment equipment_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipment_equipment_id_seq'::regclass);


--
-- Name: equipment_documents id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment_documents ALTER COLUMN id SET DEFAULT nextval('public.equipment_documents_id_seq'::regclass);


--
-- Name: equipment_history id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment_history ALTER COLUMN id SET DEFAULT nextval('public.equipment_history_id_seq'::regclass);


--
-- Name: failure_logs id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.failure_logs ALTER COLUMN id SET DEFAULT nextval('public.failure_logs_id_seq'::regclass);


--
-- Name: labor_logs id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.labor_logs ALTER COLUMN id SET DEFAULT nextval('public.labor_logs_id_seq'::regclass);


--
-- Name: maintenance_costs id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.maintenance_costs ALTER COLUMN id SET DEFAULT nextval('public.maintenance_costs_id_seq'::regclass);


--
-- Name: maintenance_plans plan_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.maintenance_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.maintenance_plans_plan_id_seq'::regclass);


--
-- Name: meter_logs log_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meter_logs ALTER COLUMN log_id SET DEFAULT nextval('public.meter_logs_log_id_seq'::regclass);


--
-- Name: meter_thresholds id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meter_thresholds ALTER COLUMN id SET DEFAULT nextval('public.meter_thresholds_id_seq'::regclass);


--
-- Name: meters meter_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meters ALTER COLUMN meter_id SET DEFAULT nextval('public.meters_meter_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: part_movements id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.part_movements ALTER COLUMN id SET DEFAULT nextval('public.part_movements_id_seq'::regclass);


--
-- Name: parts part_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.parts ALTER COLUMN part_id SET DEFAULT nextval('public.parts_part_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: schedules id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.schedules ALTER COLUMN id SET DEFAULT nextval('public.schedules_id_seq'::regclass);


--
-- Name: task_steps id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.task_steps ALTER COLUMN id SET DEFAULT nextval('public.task_steps_id_seq'::regclass);


--
-- Name: tasks task_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.tasks ALTER COLUMN task_id SET DEFAULT nextval('public.tasks_task_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: work_order_parts id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_parts ALTER COLUMN id SET DEFAULT nextval('public.work_order_parts_id_seq'::regclass);


--
-- Name: work_order_status_history id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_status_history ALTER COLUMN id SET DEFAULT nextval('public.work_order_status_history_id_seq'::regclass);


--
-- Name: work_order_tasks id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_tasks ALTER COLUMN id SET DEFAULT nextval('public.work_order_tasks_id_seq'::regclass);


--
-- Name: work_orders work_order_id; Type: DEFAULT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_orders ALTER COLUMN work_order_id SET DEFAULT nextval('public.work_orders_work_order_id_seq'::regclass);


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.alerts (id, equipment_id, work_order_id, meter_id, alert_type, message, status, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.audit_logs (id, user_id, action_type, entity_name, entity_id, action_details, created_at) FROM stdin;
1	1	LOGIN	auth	1	System Admin User logged in	2026-04-03 16:23:18.594782
2	3	LOGIN	auth	3	mohaimen aburas User logged in	2026-04-03 16:24:21.631041
3	1	LOGIN	auth	1	System Admin User logged in	2026-04-03 16:25:21.950487
4	\N	DELETE_USER	User	2	admin@hospital.com Deleted user account: johndoe@hospital.com	2026-04-03 16:25:29.073115
5	\N	UPDATE_USER	User	3	admin@hospital.com Updated user details for: mohaimen@gmail.com	2026-04-03 16:26:14.102705
6	\N	UPDATE_USER	User	1	admin@hospital.com Updated user details for: admin@hospital.com	2026-04-03 16:27:33.219581
7	1	LOGIN	auth	1	Admin User logged in	2026-04-03 19:11:27.071138
8	1	LOGIN	auth	1	Admin User logged in	2026-04-03 19:56:59.847087
9	3	LOGIN	auth	3	mohaimen ibrahim aburas User logged in	2026-04-03 20:04:53.600808
10	1	LOGIN	auth	1	Admin User logged in	2026-04-03 21:00:42.037249
11	1	LOGIN	auth	1	Admin User logged in	2026-04-03 21:06:52.124789
12	\N	CREATE_DEPT	Department	3	admin@hospital.com Created department: MAITNENCE	2026-04-03 21:40:08.995689
13	\N	CREATE_DEPT	Department	4	admin@hospital.com Created department: CLEANING	2026-04-03 21:45:36.401824
14	\N	DELETE_DEPT	Department	3	admin@hospital.com Deleted department: MAITNENCE	2026-04-03 21:47:36.783518
15	\N	CREATE_ROLE	Role	7	admin@hospital.com Created role: USER	2026-04-03 21:51:07.077722
16	\N	DELETE_ROLE	Role	7	admin@hospital.com Deleted role: USER	2026-04-03 21:52:43.361308
17	\N	CREATE_USER	User	4	admin@hospital.com Created user: Gacha@gmail.com	2026-04-03 22:04:51.502999
18	\N	UPDATE_USER	User	3	admin@hospital.com Updated user details for: Gacha1@gmail.com	2026-04-03 22:32:29.520443
19	\N	SOFT_DELETE_USER	User	3	admin@hospital.com Soft deleted user account (deactivated): Gacha1@gmail.com	2026-04-03 22:34:40.309937
20	\N	SOFT_DELETE_USER	User	3	admin@hospital.com Soft deleted user account (deactivated): Gacha1@gmail.com	2026-04-03 22:36:14.966922
21	\N	SOFT_DELETE_USER	User	3	admin@hospital.com Soft deleted user account (deactivated): Gacha1@gmail.com	2026-04-03 22:37:02.676816
22	\N	SOFT_DELETE_USER	User	4	admin@hospital.com Soft deleted user account (deactivated): Gacha@gmail.com	2026-04-03 22:37:21.587539
23	\N	SOFT_DELETE_USER	User	4	admin@hospital.com Soft deleted user account (deactivated): Gacha@gmail.com	2026-04-03 22:37:29.876321
24	\N	ENABLE_USER	User	3	admin@hospital.com Enabled account: Gacha1@gmail.com	2026-04-03 22:41:11.487861
25	\N	DISABLE_USER	User	3	admin@hospital.com Disabled account: Gacha1@gmail.com	2026-04-03 22:41:45.55365
26	1	LOGIN	auth	1	Admin User logged in	2026-04-03 23:36:58.825798
27	1	LOGIN	auth	1	Admin User logged in	2026-04-04 14:40:20.904043
28	1	LOGIN	auth	1	Admin User logged in	2026-04-04 15:08:19.332794
29	\N	LOGIN_FAILED	auth	\N	admin@cmms.com Login failed: Bad credentials	2026-04-04 15:12:16.521877
30	\N	LOGIN_FAILED	auth	\N	admin@hospital.com Login failed: Bad credentials	2026-04-04 15:14:18.449188
31	1	LOGIN	auth	1	Admin User logged in	2026-04-04 15:14:18.539903
32	1	LOGIN	auth	1	Admin User logged in	2026-04-04 17:14:34.994738
\.


--
-- Data for Name: claim_photos; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.claim_photos (photo_id, claim_id, photo_url) FROM stdin;
\.


--
-- Data for Name: claim_status_history; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.claim_status_history (id, claim_id, old_status, new_status, changed_at) FROM stdin;
\.


--
-- Data for Name: claims; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.claims (claim_id, requester_id, equipment_id, description, status, created_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.departments (department_id, department_name) FROM stdin;
1	IT Department
2	CLEANING_STAFF
4	CLEANING
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.equipment (equipment_id, name, serial_number, status, location, department_id, created_at, manufacturer, model_reference, classification, criticality, purchase_date, commissioning_date, supplier_name, contract_number, warranty_end_date) FROM stdin;
19	phillps generator 500	SN-12345	OPERATIONAL	icu 	2	2026-04-03 19:26:02.325246	\N	\N	\N	\N	\N	\N	\N	\N	\N
21	PUMP	TRX-12345	OPERATIONAL	ICU-WARD1 3FLOOR	2	2026-04-03 23:09:18.540095	\N	\N	\N	\N	\N	\N	\N	\N	\N
20	FLUSHER	sl12345	OPERATIONAL	icuwrad3 	2	2026-04-03 20:02:53.628666	\N	\N	\N	\N	\N	\N	\N	\N	\N
22	phillps	sn-12345	OPERATIONAL	ICU ward3 Floor2	2	2026-04-04 15:19:19.706241	Phillps	G500-x	medical	CRITICAL	2026-03-29	2026-04-08	medTech	Cn-1234	2026-05-09
\.


--
-- Data for Name: equipment_documents; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.equipment_documents (id, equipment_id, document_name, file_path, file_size, content_type, uploaded_at, uploaded_by) FROM stdin;
2	19	scalp.pdf	uploads\\documents\\73ee5c00-2458-4393-9096-5e9ead793e1a_scalp.pdf	\N	\N	\N	\N
3	22	CAHIER DES CHARGES GMAO (1).pdf	uploads\\documents\\8a1a5768-4b0f-4d43-9ad8-2e0f3b85e6b5_CAHIER DES CHARGES GMAO (1).pdf	423234	application/pdf	2026-04-04 15:19:34.859662	1
\.


--
-- Data for Name: equipment_history; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.equipment_history (id, equipment_id, action, performed_by, created_at) FROM stdin;
1	19	CREATED	Admin	2026-04-03 19:26:02.336928
2	19	UPDATED	Admin	2026-04-03 19:26:20.183537
3	19	UPDATED	Admin	2026-04-03 19:26:59.837158
4	19	UPDATED	Admin	2026-04-03 19:27:05.108831
5	19	UPDATED	Admin	2026-04-03 19:27:09.511665
6	20	CREATED	1	2026-04-03 20:02:53.681492
7	20	UPDATED	1	2026-04-03 20:04:24.739364
8	21	CREATED	1	2026-04-03 23:09:18.576662
9	20	UPDATED	1	2026-04-03 23:16:08.389961
10	20	ARCHIVED	1	2026-04-03 23:19:11.229801
11	20	STATUS_CHANGE: ARCHIVED -> OPERATIONAL	1	2026-04-03 23:23:22.334681
12	22	CREATED	1	2026-04-04 15:19:19.758473
13	22	ARCHIVED	1	2026-04-04 15:20:06.000743
14	22	UPDATED	1	2026-04-04 15:20:12.721552
\.


--
-- Data for Name: failure_logs; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.failure_logs (id, equipment_id, work_order_id, description, created_at) FROM stdin;
\.


--
-- Data for Name: labor_logs; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.labor_logs (id, work_order_id, technician_id, start_time, end_time, hours_spent, notes) FROM stdin;
\.


--
-- Data for Name: maintenance_costs; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.maintenance_costs (id, work_order_id, labor_cost, parts_cost, external_cost) FROM stdin;
\.


--
-- Data for Name: maintenance_plans; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.maintenance_plans (plan_id, equipment_id, frequency, name, interval_value, interval_unit, status, technician_name, last_performed_at, next_due_at) FROM stdin;
2	20	MONTHLY	cleaning 	30	DAY	ACTIVE	john doe	\N	\N
\.


--
-- Data for Name: meter_logs; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.meter_logs (log_id, meter_id, value, recorded_at) FROM stdin;
1	1	10	2026-04-04 00:03:37.139406
2	1	11	2026-04-04 15:08:27.441784
3	4	6	2026-04-04 15:20:52.001776
\.


--
-- Data for Name: meter_thresholds; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.meter_thresholds (id, meter_id, threshold_value) FROM stdin;
\.


--
-- Data for Name: meters; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.meters (meter_id, equipment_id, value, meter_type, name, unit, last_reading_at) FROM stdin;
2	19	5	\N	\N	\N	\N
3	21	5	TEMPERATURE	TOTAL-RUN-HOURS	c	\N
1	19	11	ODOMETER	TOTAL-RUN-HOURS	HOURS	\N
4	22	6	ODOMETER	TOTAL-RUN-HOURS	HOURS	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.notifications (id, user_id, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: part_movements; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.part_movements (id, part_id, quantity, movement_type, created_at) FROM stdin;
\.


--
-- Data for Name: parts; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.parts (part_id, name, stock_quantity, min_stock, unit_cost) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.roles (role_id, role_name) FROM stdin;
1	ADMIN
2	FINANCE_MANAGER
3	MAINTENANCE_MANAGER
4	TECHNICIAN
5	HOSPITAL_STAFF
6	DOCTOR
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.schedules (id, work_order_id, technician_id, planned_date, start_time, end_time) FROM stdin;
\.


--
-- Data for Name: task_steps; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.task_steps (id, task_id, step_name, status) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.tasks (task_id, name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.users (user_id, full_name, email, password_hash, role_id, department_id, is_active, created_at) FROM stdin;
1	Admin	admin@hospital.com	$2a$10$2Z1A05NDY.7IuxJS29QjQOvTvfphzpfoHo2t5M1qZ.U7LZd5eJ6pO	1	1	t	2026-04-03 01:25:13.467473
4	Ayoub Bougacha	Gacha@gmail.com	$2a$10$DkF1yKtGFw62qjzcc3wuDO20jTxyH.gRdDD0Cvb9EojIk/I2G3V/i	3	1	f	2026-04-03 22:04:51.49938
3	Ayoub Bougacha	Gacha1@gmail.com	$2a$10$hcPeZGHeYussUMWZxMBUyua9FKA7KkrMb2XWMBH41JQBGecI3eCBe	4	1	f	2026-04-03 15:45:23.770864
\.


--
-- Data for Name: work_order_parts; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.work_order_parts (id, work_order_id, part_id, quantity) FROM stdin;
\.


--
-- Data for Name: work_order_status_history; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.work_order_status_history (id, work_order_id, old_status, new_status, changed_by, changed_at, comment) FROM stdin;
\.


--
-- Data for Name: work_order_tasks; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.work_order_tasks (id, work_order_id, task_id, status) FROM stdin;
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: mohaimen
--

COPY public.work_orders (work_order_id, claim_id, technician_id, status, priority, created_at, estimated_time, actual_time, total_cost, validated_by, validated_at) FROM stdin;
\.


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.alerts_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 32, true);


--
-- Name: claim_photos_photo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.claim_photos_photo_id_seq', 1, false);


--
-- Name: claim_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.claim_status_history_id_seq', 1, false);


--
-- Name: claims_claim_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.claims_claim_id_seq', 1, false);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 4, true);


--
-- Name: equipment_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.equipment_documents_id_seq', 3, true);


--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.equipment_equipment_id_seq', 22, true);


--
-- Name: equipment_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.equipment_history_id_seq', 14, true);


--
-- Name: failure_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.failure_logs_id_seq', 1, false);


--
-- Name: labor_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.labor_logs_id_seq', 1, false);


--
-- Name: maintenance_costs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.maintenance_costs_id_seq', 1, false);


--
-- Name: maintenance_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.maintenance_plans_plan_id_seq', 2, true);


--
-- Name: meter_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.meter_logs_log_id_seq', 3, true);


--
-- Name: meter_thresholds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.meter_thresholds_id_seq', 1, true);


--
-- Name: meters_meter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.meters_meter_id_seq', 4, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: part_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.part_movements_id_seq', 1, false);


--
-- Name: parts_part_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.parts_part_id_seq', 1, false);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 7, true);


--
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.schedules_id_seq', 1, false);


--
-- Name: task_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.task_steps_id_seq', 1, false);


--
-- Name: tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.tasks_task_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.users_user_id_seq', 4, true);


--
-- Name: work_order_parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.work_order_parts_id_seq', 1, false);


--
-- Name: work_order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.work_order_status_history_id_seq', 1, false);


--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.work_order_tasks_id_seq', 1, false);


--
-- Name: work_orders_work_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mohaimen
--

SELECT pg_catalog.setval('public.work_orders_work_order_id_seq', 1, false);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: claim_photos claim_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claim_photos
    ADD CONSTRAINT claim_photos_pkey PRIMARY KEY (photo_id);


--
-- Name: claim_status_history claim_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claim_status_history
    ADD CONSTRAINT claim_status_history_pkey PRIMARY KEY (id);


--
-- Name: claims claims_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_pkey PRIMARY KEY (claim_id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: equipment_documents equipment_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment_documents
    ADD CONSTRAINT equipment_documents_pkey PRIMARY KEY (id);


--
-- Name: equipment_history equipment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment_history
    ADD CONSTRAINT equipment_history_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- Name: failure_logs failure_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.failure_logs
    ADD CONSTRAINT failure_logs_pkey PRIMARY KEY (id);


--
-- Name: labor_logs labor_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.labor_logs
    ADD CONSTRAINT labor_logs_pkey PRIMARY KEY (id);


--
-- Name: maintenance_costs maintenance_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.maintenance_costs
    ADD CONSTRAINT maintenance_costs_pkey PRIMARY KEY (id);


--
-- Name: maintenance_plans maintenance_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.maintenance_plans
    ADD CONSTRAINT maintenance_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: meter_logs meter_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meter_logs
    ADD CONSTRAINT meter_logs_pkey PRIMARY KEY (log_id);


--
-- Name: meter_thresholds meter_thresholds_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meter_thresholds
    ADD CONSTRAINT meter_thresholds_pkey PRIMARY KEY (id);


--
-- Name: meters meters_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meters
    ADD CONSTRAINT meters_pkey PRIMARY KEY (meter_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: part_movements part_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.part_movements
    ADD CONSTRAINT part_movements_pkey PRIMARY KEY (id);


--
-- Name: parts parts_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_pkey PRIMARY KEY (part_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: task_steps task_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.task_steps
    ADD CONSTRAINT task_steps_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: work_order_parts work_order_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_parts
    ADD CONSTRAINT work_order_parts_pkey PRIMARY KEY (id);


--
-- Name: work_order_status_history work_order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_status_history
    ADD CONSTRAINT work_order_status_history_pkey PRIMARY KEY (id);


--
-- Name: work_order_tasks work_order_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (work_order_id);


--
-- Name: alerts alerts_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: alerts alerts_meter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);


--
-- Name: alerts alerts_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: claim_photos claim_photos_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claim_photos
    ADD CONSTRAINT claim_photos_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES public.claims(claim_id);


--
-- Name: claim_status_history claim_status_history_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claim_status_history
    ADD CONSTRAINT claim_status_history_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES public.claims(claim_id);


--
-- Name: claims claims_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: claims claims_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(user_id);


--
-- Name: equipment equipment_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: equipment_documents equipment_documents_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment_documents
    ADD CONSTRAINT equipment_documents_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: equipment_history equipment_history_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.equipment_history
    ADD CONSTRAINT equipment_history_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: failure_logs failure_logs_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.failure_logs
    ADD CONSTRAINT failure_logs_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: failure_logs failure_logs_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.failure_logs
    ADD CONSTRAINT failure_logs_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: work_orders fk_work_orders_validated_by; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT fk_work_orders_validated_by FOREIGN KEY (validated_by) REFERENCES public.users(user_id);


--
-- Name: labor_logs labor_logs_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.labor_logs
    ADD CONSTRAINT labor_logs_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);


--
-- Name: labor_logs labor_logs_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.labor_logs
    ADD CONSTRAINT labor_logs_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: maintenance_costs maintenance_costs_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.maintenance_costs
    ADD CONSTRAINT maintenance_costs_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: maintenance_plans maintenance_plans_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.maintenance_plans
    ADD CONSTRAINT maintenance_plans_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: meter_logs meter_logs_meter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meter_logs
    ADD CONSTRAINT meter_logs_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);


--
-- Name: meter_thresholds meter_thresholds_meter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meter_thresholds
    ADD CONSTRAINT meter_thresholds_meter_id_fkey FOREIGN KEY (meter_id) REFERENCES public.meters(meter_id);


--
-- Name: meters meters_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.meters
    ADD CONSTRAINT meters_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: part_movements part_movements_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.part_movements
    ADD CONSTRAINT part_movements_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(part_id);


--
-- Name: schedules schedules_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);


--
-- Name: schedules schedules_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: task_steps task_steps_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.task_steps
    ADD CONSTRAINT task_steps_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: work_order_parts work_order_parts_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_parts
    ADD CONSTRAINT work_order_parts_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(part_id);


--
-- Name: work_order_parts work_order_parts_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_parts
    ADD CONSTRAINT work_order_parts_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: work_order_status_history work_order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_status_history
    ADD CONSTRAINT work_order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id);


--
-- Name: work_order_status_history work_order_status_history_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_status_history
    ADD CONSTRAINT work_order_status_history_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: work_order_tasks work_order_tasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id);


--
-- Name: work_order_tasks work_order_tasks_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(work_order_id);


--
-- Name: work_orders work_orders_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES public.claims(claim_id);


--
-- Name: work_orders work_orders_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mohaimen
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict MrgNGUtDdWD9s5bXmyIMIbIiPzQ1iyHmHIa9yKN11TIG4r0RAuQfOJYwHep3ZK6

