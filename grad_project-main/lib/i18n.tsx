"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type Language = "en" | "fr"

const translations = {
  en: {
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    equipment: "Equipment",
    claims: "Claims",
    workOrders: "Work Orders",
    tasks: "Tasks",
    planning: "Planning",
    calendar: "Calendar",
    kanban: "Kanban Board",
    workload: "Team Workload",
    gantt: "Gantt Chart",
    meters: "Meters",
    inventory: "Inventory",
    ai: "AI",
    prioritization: "Prioritization",
    predictive: "Predictive",
    failureAnalysis: "Failure Analysis",
    bi: "Business Intelligence",
    executive: "Executive",
    maintenance: "Maintenance",
    biomedical: "Biomedical",
    financial: "Financial",
    admin: "Administration",
    users: "Users",
    roles: "Roles",
    referenceData: "Reference Data",
    rulesThresholds: "Rules & Thresholds",
    auditLogs: "Audit Logs",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    
    // Landing Page
    heroTitle: "Hospital CMMS/GMAO Platform",
    heroSubtitle: "Centralize equipment management, streamline maintenance workflows, and leverage AI for predictive maintenance",
    requestDemo: "Request Demo",
    signIn: "Sign In",
    exploreDashboard: "Explore Dashboard",
    features: "Features",
    kpiPreview: "KPI Preview",
    testimonials: "Testimonials",
    
    // Features
    equipmentRegistry: "Equipment Registry",
    equipmentRegistryDesc: "Centralized database for all biomedical, technical, and IT equipment with complete history",
    incidentWorkflow: "Incident Workflow",
    incidentWorkflowDesc: "Streamlined complaint management from creation to resolution with automatic notifications",
    workOrderManagement: "Work Order Management",
    workOrderManagementDesc: "Corrective, preventive, regulatory, and predictive work orders with full traceability",
    taskChecklists: "Task Checklists",
    taskChecklistsDesc: "Digital checklists with step validation and standard durations",
    planningCalendar: "Planning & Gantt",
    planningCalendarDesc: "Calendar-based, meter-based, and AI-prediction-based maintenance planning",
    metersThresholds: "Meters & Thresholds",
    metersThresholdsDesc: "Track operating hours, cycles, and acts with automatic threshold alerts",
    sparePartsStock: "Spare Parts & Stock",
    sparePartsStockDesc: "Parts repository with minimum stock alerts and consumption analytics",
    aiPrioritization: "AI Prioritization",
    aiPrioritizationDesc: "Intelligent prioritization based on criticality, impact, and failure history",
    predictiveMaintenance: "Predictive Maintenance",
    predictiveMaintenanceDesc: "Risk scoring and intervention recommendations using AI models",
    biDashboards: "BI Dashboards",
    biDashboardsDesc: "Executive, maintenance, biomedical, and financial analytics dashboards",
    
    // KPIs
    mtbf: "MTBF",
    mtbfFull: "Mean Time Between Failures",
    mttr: "MTTR",
    mttrFull: "Mean Time To Repair",
    availabilityRate: "Availability Rate",
    correctivePreventiveRatio: "Corrective/Preventive Ratio",
    maintenanceCostEquipment: "Cost per Equipment",
    maintenanceCostService: "Cost per Service",
    hours: "hours",
    
    // Login
    welcomeBack: "Welcome Back!",
    loginToAccount: "Login to your account",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    login: "Login",
    createAccountWith: "Create account with",
    demoLogins: "Demo Logins",
    administrator: "Administrator",
    maintenanceManager: "Maintenance Manager",
    technician: "Technician",
    directionFinance: "Direction / Finance",
    secureLogin: "Secure JWT Authentication",
    
    // Dashboard
    overview: "Overview",
    totalEquipment: "Total Equipment",
    activeWorkOrders: "Active Work Orders",
    pendingClaims: "Pending Claims",
    criticalAlerts: "Critical Alerts",
    recentActivity: "Recent Activity",
    upcomingMaintenance: "Upcoming Maintenance",
    quickActions: "Quick Actions",
    newClaim: "New Claim",
    newWorkOrder: "New Work Order",
    viewAll: "View All",
    search: "Search",
    notifications: "Notifications",
    
    // Equipment
    equipmentList: "Equipment List",
    addEquipment: "Add Equipment",
    equipmentDetails: "Equipment Details",
    serialNumber: "Serial Number",
    location: "Location",
    department: "Department",
    classification: "Classification",
    criticality: "Criticality",
    status: "Status",
    lastMaintenance: "Last Maintenance",
    nextMaintenance: "Next Maintenance",
    documents: "Documents",
    interventionHistory: "Intervention History",
    
    // Claims
    claimsList: "Claims List",
    newClaimTitle: "New Claim",
    claimDetails: "Claim Details",
    qualification: "Qualification",
    assignment: "Assignment",
    description: "Description",
    priority: "Priority",
    createdBy: "Created By",
    createdAt: "Created At",
    assignedTo: "Assigned To",
    
    // Work Orders
    workOrdersList: "Work Orders List",
    workOrderDetails: "Work Order Details",
    type: "Type",
    corrective: "Corrective",
    preventive: "Preventive",
    regulatory: "Regulatory",
    estimatedTime: "Estimated Time",
    actualTime: "Actual Time",
    partsUsed: "Parts Used",
    cost: "Cost",
    
    // Status
    active: "Active",
    outOfService: "Out of Service",
    retired: "Retired",
    operational: "Operational",
    underRepair: "Under Repair",
    archived: "Archived",
    open: "Open",
    qualified: "Qualified",
    assigned: "Assigned",
    inProgress: "In Progress",
    underControl: "Under Control",
    closed: "Closed",
    overdue: "Overdue",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    export: "Export",
    filter: "Filter",
    sort: "Sort",
    actions: "Actions",
    dateRange: "Date Range",
    selectSite: "Select Site",
    selectDepartment: "Select Department",
    allSites: "All Sites",
    allDepartments: "All Departments",
    loading: "Loading...",
    noData: "No data available",
    
    // Footer
    product: "Product",
    modules: "Modules",
    security: "Security",
    support: "Support",
    contact: "Contact",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All rights reserved",

    // Meter Alerts
    preventiveRecommendation: "Preventive Maintenance Recommendation",
    thresholdExceededTitle: "Threshold Exceeded",
    thresholdExceededDesc: "One or more meters have exceeded their defined thresholds. Early intervention is recommended to prevent critical failure.",
    createPreventiveWO: "Create Preventive Work Order",
    ignoreAlert: "Ignore for now",
    recommendedPlan: "Recommended Action Plan",
    equipmentUnderRepair: "Equipment status updated to Under Repair.",
    woCreatedSuccess: "Preventive Work Order created successfully.",
  },
  fr: {
    // Navigation
    home: "Accueil",
    dashboard: "Tableau de bord",
    equipment: "Équipements",
    claims: "Réclamations",
    workOrders: "Ordres de travail",
    tasks: "Tâches",
    planning: "Planification",
    calendar: "Calendrier",
    kanban: "Tableau Kanban",
    workload: "Charge d'équipe",
    gantt: "Diagramme de Gantt",
    meters: "Compteurs",
    inventory: "Inventaire",
    ai: "IA",
    prioritization: "Priorisation",
    predictive: "Prédictif",
    failureAnalysis: "Analyse des pannes",
    bi: "Intelligence d'affaires",
    executive: "Direction",
    maintenance: "Maintenance",
    biomedical: "Biomédical",
    financial: "Financier",
    admin: "Administration",
    users: "Utilisateurs",
    roles: "Rôles",
    referenceData: "Données de référence",
    rulesThresholds: "Règles et seuils",
    auditLogs: "Journaux d'audit",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    
    // Landing Page
    heroTitle: "Plateforme GMAO Hospitalière",
    heroSubtitle: "Centralisez la gestion des équipements, optimisez les flux de maintenance et exploitez l'IA pour la maintenance prédictive",
    requestDemo: "Demander une démo",
    signIn: "Se connecter",
    exploreDashboard: "Explorer le tableau de bord",
    features: "Fonctionnalités",
    kpiPreview: "Aperçu des KPI",
    testimonials: "Témoignages",
    
    // Features
    equipmentRegistry: "Registre des équipements",
    equipmentRegistryDesc: "Base de données centralisée pour tous les équipements biomédicaux, techniques et informatiques",
    incidentWorkflow: "Flux d'incidents",
    incidentWorkflowDesc: "Gestion simplifiée des plaintes de la création à la résolution avec notifications automatiques",
    workOrderManagement: "Gestion des ordres de travail",
    workOrderManagementDesc: "Ordres de travail correctifs, préventifs, réglementaires et prédictifs avec traçabilité complète",
    taskChecklists: "Listes de contrôle",
    taskChecklistsDesc: "Listes de contrôle numériques avec validation des étapes et durées standard",
    planningCalendar: "Planification et Gantt",
    planningCalendarDesc: "Planification de maintenance basée sur le calendrier, les compteurs et les prédictions IA",
    metersThresholds: "Compteurs et seuils",
    metersThresholdsDesc: "Suivez les heures de fonctionnement, les cycles et les actes avec des alertes de seuil automatiques",
    sparePartsStock: "Pièces détachées et stock",
    sparePartsStockDesc: "Référentiel de pièces avec alertes de stock minimum et analyses de consommation",
    aiPrioritization: "Priorisation IA",
    aiPrioritizationDesc: "Priorisation intelligente basée sur la criticité, l'impact et l'historique des pannes",
    predictiveMaintenance: "Maintenance prédictive",
    predictiveMaintenanceDesc: "Évaluation des risques et recommandations d'intervention utilisant des modèles IA",
    biDashboards: "Tableaux de bord BI",
    biDashboardsDesc: "Tableaux de bord analytiques pour la direction, la maintenance, le biomédical et les finances",
    
    // KPIs
    mtbf: "MTBF",
    mtbfFull: "Temps moyen entre pannes",
    mttr: "MTTR",
    mttrFull: "Temps moyen de réparation",
    availabilityRate: "Taux de disponibilité",
    correctivePreventiveRatio: "Ratio Correctif/Préventif",
    maintenanceCostEquipment: "Coût par équipement",
    maintenanceCostService: "Coût par service",
    hours: "heures",
    
    // Login
    welcomeBack: "Bienvenue!",
    loginToAccount: "Connectez-vous à votre compte",
    email: "Email",
    password: "Mot de passe",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié?",
    login: "Connexion",
    createAccountWith: "Créer un compte avec",
    demoLogins: "Connexions de démonstration",
    administrator: "Administrateur",
    maintenanceManager: "Responsable maintenance",
    technician: "Technicien",
    directionFinance: "Direction / Finance",
    secureLogin: "Authentification JWT sécurisée",
    
    // Dashboard
    overview: "Vue d'ensemble",
    totalEquipment: "Équipements totaux",
    activeWorkOrders: "Ordres actifs",
    pendingClaims: "Réclamations en attente",
    criticalAlerts: "Alertes critiques",
    recentActivity: "Activité récente",
    upcomingMaintenance: "Maintenance à venir",
    quickActions: "Actions rapides",
    newClaim: "Nouvelle réclamation",
    newWorkOrder: "Nouvel ordre de travail",
    viewAll: "Voir tout",
    search: "Rechercher",
    notifications: "Notifications",
    
    // Equipment
    equipmentList: "Liste des équipements",
    addEquipment: "Ajouter un équipement",
    equipmentDetails: "Détails de l'équipement",
    serialNumber: "Numéro de série",
    location: "Emplacement",
    department: "Département",
    classification: "Classification",
    criticality: "Criticité",
    status: "Statut",
    lastMaintenance: "Dernière maintenance",
    nextMaintenance: "Prochaine maintenance",
    documents: "Documents",
    interventionHistory: "Historique des interventions",
    
    // Claims
    claimsList: "Liste des réclamations",
    newClaimTitle: "Nouvelle réclamation",
    claimDetails: "Détails de la réclamation",
    qualification: "Qualification",
    assignment: "Affectation",
    description: "Description",
    priority: "Priorité",
    createdBy: "Créé par",
    createdAt: "Créé le",
    assignedTo: "Assigné à",
    
    // Work Orders
    workOrdersList: "Liste des ordres de travail",
    workOrderDetails: "Détails de l'ordre de travail",
    type: "Type",
    corrective: "Correctif",
    preventive: "Préventif",
    regulatory: "Réglementaire",
    estimatedTime: "Temps estimé",
    actualTime: "Temps réel",
    partsUsed: "Pièces utilisées",
    cost: "Coût",
    
    // Status
    active: "Actif",
    outOfService: "Hors service",
    retired: "Retiré",
    operational: "Opérationnel",
    underRepair: "En réparation",
    archived: "Archivé",
    open: "Ouvert",
    qualified: "Qualifié",
    assigned: "Assigné",
    inProgress: "En cours",
    underControl: "Sous contrôle",
    closed: "Fermé",
    overdue: "En retard",
    critical: "Critique",
    high: "Élevé",
    medium: "Moyen",
    low: "Faible",
    
    // Common
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    view: "Voir",
    export: "Exporter",
    filter: "Filtrer",
    sort: "Trier",
    actions: "Actions",
    dateRange: "Période",
    selectSite: "Sélectionner le site",
    selectDepartment: "Sélectionner le département",
    allSites: "Tous les sites",
    allDepartments: "Tous les départements",
    loading: "Chargement...",
    noData: "Aucune donnée disponible",
    
    // Footer
    product: "Produit",
    modules: "Modules",
    security: "Sécurité",
    support: "Support",
    contact: "Contact",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d'utilisation",
    allRightsReserved: "Tous droits réservés",

    // Meter Alerts
    preventiveRecommendation: "Recommandation de Maintenance Préventive",
    thresholdExceededTitle: "Seuil dépassé",
    thresholdExceededDesc: "Un ou plusieurs compteurs ont dépassé leurs seuils définis. Une intervention précoce est recommandée pour éviter une panne critique.",
    createPreventiveWO: "Créer un Ordre de Travail Préventif",
    ignoreAlert: "Ignorer pour l'instant",
    recommendedPlan: "Plan d'action recommandé",
    equipmentUnderRepair: "Statut de l'équipement mis à jour : En réparation.",
    woCreatedSuccess: "Ordre de travail préventif créé avec succès.",
  },
}

type TranslationKey = keyof typeof translations.en

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = useCallback(
    (key: string): string => {
      return (translations[language] as Record<string, string>)[key] || key
    },
    [language]
  )

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted p-1">
      <button
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("fr")}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
          language === "fr"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        FR
      </button>
    </div>
  )
}
