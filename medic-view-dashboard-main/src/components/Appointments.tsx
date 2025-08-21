import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  CalendarIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Target,
  Clock,
  User,
  CheckCircle,
  XCircle,
  PlayCircle,
  Globe,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

// Updated appointment status type
type AppointmentStatus = "arrive" | "termine" | "reprogramme" | "confirme";

interface Appointment {
  id: string;
  patientName: string;
  phoneNumber: string;
  objective: string;
  date: Date;
  time: string;
  status: AppointmentStatus;
  doctorId?: string;
}

// Language context and translations
const translations = {
  fr: {
    title: "Gestion des Rendez-vous",
    subtitle: "Organisez et suivez vos consultations efficacement",
    newAppointment: "Nouveau rendez-vous",
    editAppointment: "Modifier le rendez-vous",
    patientName: "Nom du patient",
    phoneNumber: "Numéro de téléphone",
    consultationObjective: "Objectif de la consultation",
    date: "Date",
    time: "Heure",
    status: "Statut",
    scheduled: "Planifié",
    completed: "Terminé",
    cancelled: "Annulé",
    search: "Rechercher par nom, téléphone ou objectif...",
    filterByStatus: "Filtrer par statut",
    allStatuses: "Tous les statuts",
    scheduled_plural: "Planifiés",
    completed_plural: "Terminés",
    cancelled_plural: "Annulés",
    today: "Aujourd'hui",
    total: "Total",
    noAppointmentsFound: "Aucun rendez-vous trouvé",
    noAppointmentsMessage:
      "Commencez par créer votre premier rendez-vous en cliquant sur le bouton ci-dessus",
    searchMessage:
      "Essayez de modifier vos critères de recherche pour voir plus de résultats",
    appointmentsFound: "rendez-vous trouvé",
    appointmentsFoundPlural: "rendez-vous trouvés",
    cancel: "Annuler",
    create: "Créer",
    edit: "Modifier",
    loading: "En cours...",
    delete: "Supprimer",
    statusMenu: "Statut",
    markAsScheduled: "Marquer comme planifié",
    markAsCompleted: "Marquer comme terminé",
    markAsCancelled: "Marquer comme annulé",
    chooseDatePlaceholder: "Choisir une date",
    patientNamePlaceholder: "Nom complet du patient",
    phonePlaceholder: "0612345678",
    objectivePlaceholder: "Décrivez l'objectif de la consultation...",
    errors: {
      allFieldsRequired: "Veuillez remplir tous les champs",
      mustBeLoggedIn: "Vous devez être connecté",
      loginRequired: "Vous devez être connecté pour voir les rendez-vous",
      loadError: "Impossible de charger les rendez-vous",
      deleteError: "Une erreur s'est produite lors de la suppression",
      statusUpdateError:
        "Une erreur s'est produite lors de la mise à jour du statut",
      genericError: "Une erreur est survenue",
      invalidName: "Le nom ne doit contenir que des lettres, espaces et tirets",
      nameMaxLength: "Le nom ne doit pas dépasser 30 caractères",
      invalidPhone: "Le numéro doit contenir uniquement des chiffres",
      subscriptionLimit: {
        title: "Limite d'abonnement atteinte",
        description:
          "Vous avez atteint votre limite mensuelle de rendez-vous. Veuillez mettre à niveau votre abonnement pour continuer.",
      },
    },
    success: {
      appointmentCreated: "Rendez-vous créé avec succès",
      appointmentUpdated: "Rendez-vous modifié avec succès",
      appointmentDeleted: "Le rendez-vous a été supprimé avec succès",
      statusUpdated: "Statut mis à jour",
      statusScheduled: "Le rendez-vous a été marqué comme planifié",
      statusCompleted: "Le rendez-vous a été marqué comme terminé",
      statusCancelled: "Le rendez-vous a été marqué comme annulé",
      statusArrived: "Le rendez-vous a été marqué comme arrivé",
      statusFinished: "Le rendez-vous a été marqué comme terminé",
      statusRescheduled: "Le rendez-vous a été marqué comme reprogrammé",
      statusConfirmed: "Le rendez-vous a été marqué comme confirmé",
    },
    arrive: "Arrivé",
    termine: "Terminé",
    reprogramme: "Reprogrammé",
    confirme: "Confirmé",
    filterByDay: "Filtrer par jour",
    allDays: "Tous les jours",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    markAsArrived: "Marquer comme arrivé",
    markAsFinished: "Marquer comme terminé",
    markAsRescheduled: "Marquer comme reprogrammé",
    markAsConfirmed: "Marquer comme confirmé",
  },
  en: {
    title: "Appointment Management",
    subtitle: "Organize and track your consultations efficiently",
    newAppointment: "New appointment",
    editAppointment: "Edit appointment",
    patientName: "Patient name",
    phoneNumber: "Phone number",
    consultationObjective: "Consultation objective",
    date: "Date",
    time: "Time",
    status: "Status",
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    search: "Search by name, phone or objective...",
    filterByStatus: "Filter by status",
    allStatuses: "All statuses",
    scheduled_plural: "Scheduled",
    completed_plural: "Completed",
    cancelled_plural: "Cancelled",
    today: "Today",
    total: "Total",
    noAppointmentsFound: "No appointments found",
    noAppointmentsMessage:
      "Start by creating your first appointment using the button above",
    searchMessage: "Try modifying your search criteria to see more results",
    appointmentsFound: "appointment found",
    appointmentsFoundPlural: "appointments found",
    cancel: "Cancel",
    create: "Create",
    edit: "Edit",
    loading: "Loading...",
    delete: "Delete",
    statusMenu: "Status",
    markAsScheduled: "Mark as scheduled",
    markAsCompleted: "Mark as completed",
    markAsCancelled: "Mark as cancelled",
    chooseDatePlaceholder: "Choose a date",
    patientNamePlaceholder: "Patient full name",
    phonePlaceholder: "0612345678",
    objectivePlaceholder: "Describe the consultation objective...",
    errors: {
      allFieldsRequired: "Please fill in all fields",
      mustBeLoggedIn: "You must be logged in",
      loginRequired: "You must be logged in to view appointments",
      loadError: "Unable to load appointments",
      deleteError: "An error occurred during deletion",
      statusUpdateError: "An error occurred while updating the status",
      genericError: "An error occurred",
      invalidName: "Name must contain only letters, spaces and hyphens",
      nameMaxLength: "Name must not exceed 30 characters",
      invalidPhone: "Phone number must contain only digits",
      subscriptionLimit: {
        title: "Subscription Limit Reached",
        description:
          "You have reached your monthly appointment limit. Please upgrade your subscription to continue.",
      },
    },
    success: {
      appointmentCreated: "Appointment created successfully",
      appointmentUpdated: "Appointment updated successfully",
      appointmentDeleted: "Appointment deleted successfully",
      statusUpdated: "Status updated",
      statusScheduled: "Appointment marked as scheduled",
      statusCompleted: "Appointment marked as completed",
      statusCancelled: "Appointment marked as cancelled",
      statusArrived: "Appointment marked as arrived",
      statusFinished: "Appointment marked as finished",
      statusRescheduled: "Appointment marked as rescheduled",
      statusConfirmed: "Appointment marked as confirmed",
    },
    arrive: "Arrived",
    termine: "Completed",
    reprogramme: "Rescheduled",
    confirme: "Confirmed",
    filterByDay: "Filter by day",
    allDays: "All days",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    markAsArrived: "Mark as arrived",
    markAsFinished: "Mark as finished",
    markAsRescheduled: "Mark as rescheduled",
    markAsConfirmed: "Mark as confirmed",
  },
};

const TIER_LIMITS = {
  basic: {
    appointments: 5,
  },
  standard: {
    appointments: 10,
  },
  premium: {
    appointments: Infinity,
  },
};

const Appointments = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAppointments, setRemainingAppointments] = useState<
    number | null
  >(null);

  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    objective: "",
    date: undefined as Date | undefined,
    time: "",
    status: "confirme" as AppointmentStatus,
  });

  // Days mapping for filtering
  const daysMapping = [
    { value: "0", label: t.sunday },
    { value: "1", label: t.monday },
    { value: "2", label: t.tuesday },
    { value: "3", label: t.wednesday },
    { value: "4", label: t.thursday },
    { value: "5", label: t.friday },
    { value: "6", label: t.saturday },
  ];

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const doctorId = localStorage.getItem("doctorId");

      if (!token || !doctorId) {
        toast({
          title: "Erreur",
          description: t.errors.loginRequired,
          variant: "destructive",
        });
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            doctorId: doctorId,
          },
        }
      );

      const sanitizedAppointments = response.data.map((appointment: any) => ({
        id: appointment._id,
        patientName: appointment.fullname,
        phoneNumber: appointment.number,
        objective: appointment.objectives,
        date: new Date(appointment.date),
        time: appointment.hour,
        status: appointment.status || "confirme",
        doctorId: appointment.doctor,
      }));

      setAppointments(sanitizedAppointments);
    } catch (error) {
      toast({
        title: "Erreur",
        description: t.errors.loadError,
        variant: "destructive",
      });
    }
  };

  const getRemainingAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/doctors/subscription/usage`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const { monthlyUsage, limits, tier } = response.data;
        const limit = limits.appointments;
        return limit === Infinity ? Infinity : limit - monthlyUsage.appointments;
      }
      return null;
    } catch (error) {
      console.error("Error fetching remaining appointments:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchRemaining = async () => {
      const remaining = await getRemainingAppointments();
      setRemainingAppointments(remaining);
    };
    fetchRemaining();
  }, [appointments]);

  const startEditing = (appointment: Appointment) => {
    setFormData({
      patientName: appointment.patientName,
      phoneNumber: appointment.phoneNumber,
      objective: appointment.objective,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    });
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch =
        appointment.patientName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.phoneNumber?.includes(searchTerm) ||
        appointment.objective?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || appointment.status === filterStatus;

      const matchesDay =
        filterDay === "all" ||
        new Date(appointment.date).getDay().toString() === filterDay;

      return matchesSearch && matchesStatus && matchesDay;
    });
  }, [appointments, searchTerm, filterStatus, filterDay]);

  const resetForm = () => {
    setFormData({
      patientName: "",
      phoneNumber: "",
      objective: "",
      date: undefined,
      time: "",
      status: "confirme",
    });
    setEditingAppointment(null);
  };

  // Validation functions
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s-]*$/;
    return nameRegex.test(name) && name.length <= 30;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d*$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.patientName ||
      !formData.phoneNumber ||
      !formData.objective ||
      !formData.date ||
      !formData.time
    ) {
      toast({
        title: "Erreur",
        description: t.errors.allFieldsRequired,
        variant: "destructive",
      });
      return;
    }

    if (!validateName(formData.patientName)) {
      toast({
        title: "Erreur",
        description: t.errors.invalidName,
        variant: "destructive",
      });
      return;
    }

    if (!validatePhone(formData.phoneNumber)) {
      toast({
        title: "Erreur",
        description: t.errors.invalidPhone,
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    const doctorId = localStorage.getItem("doctorId");

    if (!token || !doctorId) {
      toast({
        title: "Erreur",
        description: t.errors.mustBeLoggedIn,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const appointmentData = {
        fullname: formData.patientName,
        number: formData.phoneNumber,
        objectives: formData.objective,
        date: formData.date,
        hour: formData.time,
        status: formData.status,
        doctor: doctorId,
      };

      let response;

      if (editingAppointment) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}api/appointments/${
            editingAppointment.id
          }`,
          appointmentData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}api/appointments`,
          appointmentData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.data.success) {
        toast({
          title: "Succès",
          description: editingAppointment
            ? t.success.appointmentUpdated
            : t.success.appointmentCreated,
        });
        await fetchAppointments();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response?.data?.message?.includes("limit")
      ) {
        toast({
          title: t.errors.subscriptionLimit.title,
          description: t.errors.subscriptionLimit.description,
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => {
                // Navigate to upgrade page or show upgrade modal
                window.location.href = "/admin"; // Or your pricing page
              }}
            >
              Upgrade
            </Button>
          ),
        });
      } else {
        toast({
          title: "Erreur",
          description: error.response?.data?.message || t.errors.genericError,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}api/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      toast({
        title: t.success.appointmentDeleted.split(" ")[0],
        description: t.success.appointmentDeleted,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: t.errors.deleteError,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    try {
      const token = localStorage.getItem("token");
      const appointment = appointments.find((apt) => apt.id === appointmentId);
      if (!appointment) return;

      const appointmentData = {
        fullname: appointment.patientName,
        number: appointment.phoneNumber,
        objectives: appointment.objective,
        date: appointment.date,
        hour: appointment.time,
        status: newStatus,
        doctor: localStorage.getItem("doctorId"),
      };

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}api/appointments/${appointmentId}`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      const statusMessages = {
        arrive: t.success.statusArrived,
        termine: t.success.statusFinished,
        reprogramme: t.success.statusRescheduled,
        confirme: t.success.statusConfirmed,
      };

      toast({
        title: t.success.statusUpdated,
        description: statusMessages[newStatus],
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: t.errors.statusUpdateError,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      arrive: {
        className:
          "bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800",
        icon: PlayCircle,
        label: t.arrive,
      },
      termine: {
        className:
          "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800",
        icon: CheckCircle,
        label: t.termine,
      },
      reprogramme: {
        className:
          "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800",
        icon: Clock,
        label: t.reprogramme,
      },
      confirme: {
        className:
          "bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800",
        icon: CheckCircle,
        label: t.confirme,
      },
    };

    const config = statusConfig[status] || {
      className: "",
      icon: PlayCircle,
      label: status,
    };
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatsData = () => {
    const total = appointments.length;
    const arrive = appointments.filter((apt) => apt.status === "arrive").length;
    const termine = appointments.filter(
      (apt) => apt.status === "termine"
    ).length;
    const reprogramme = appointments.filter(
      (apt) => apt.status === "reprogramme"
    ).length;
    const confirme = appointments.filter(
      (apt) => apt.status === "confirme"
    ).length;
    const today = appointments.filter((apt) => {
      const appointmentDate = new Date(apt.date);
      return appointmentDate.toDateString() === new Date().toDateString();
    }).length;

    return { total, arrive, termine, reprogramme, confirme, today };
  };

  const stats = getStatsData();
  const locale = language === "fr" ? fr : enUS;

  // Add these styles at the top of your file
  const dayFilterButtonStyles = {
    base: "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
    active: "bg-primary text-white shadow-lg hover:bg-primary/90",
    inactive:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-3xl opacity-10"></div>
        <div className="relative bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg rounded-xl sm:rounded-2xl">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    {t.newAppointment}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 backdrop-blur-sm border-0 shadow-2xl rounded-2xl sm:rounded-3xl mx-2 sm:mx-auto">
                  <DialogHeader className="pb-4 sm:pb-6 px-1">
                    <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100 text-center sm:text-left">
                      {editingAppointment
                        ? t.editAppointment
                        : t.newAppointment}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 sm:space-y-6 px-1">
                    {/* Patient Name and Phone - Stack on mobile */}
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3">
                        <Label
                          htmlFor="patientName"
                          className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {t.patientName}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-[13px] text-slate-400 dark:text-slate-500 h-4 w-4 z-10" />
                          <Input
                            id="patientName"
                            value={formData.patientName}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (validateName(value)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  patientName: value,
                                }));
                              }
                            }}
                            placeholder={t.patientNamePlaceholder}
                            maxLength={30}
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20 rounded-xl bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
                          />
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {formData.patientName.length}/30
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label
                          htmlFor="phoneNumber"
                          className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {t.phoneNumber}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-[13px] text-slate-400 dark:text-slate-500 h-4 w-4 z-10" />
                          <Input
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (validatePhone(value)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  phoneNumber: value,
                                }));
                              }
                            }}
                            placeholder={t.phonePlaceholder}
                            maxLength={15}
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20 rounded-xl bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Consultation Objective */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label
                        htmlFor="objective"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {t.consultationObjective}
                      </Label>
                      <div className="relative">
                        <Target className="absolute left-3 top-[13px] text-slate-400 dark:text-slate-500 h-4 w-4 z-10" />
                        <Textarea
                          id="objective"
                          value={formData.objective}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              objective: e.target.value,
                            }))
                          }
                          placeholder={t.objectivePlaceholder}
                          rows={3}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20 rounded-xl resize-none bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Date and Time - Stack on mobile */}
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t.date}
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal rounded-xl py-2 sm:py-3 px-3",
                                "border-slate-200 dark:border-slate-600",
                                "bg-white dark:bg-gray-800",
                                "hover:border-blue-500 dark:hover:border-blue-400",
                                "text-slate-900 dark:text-slate-100",
                                "hover:bg-slate-50 dark:hover:bg-gray-700",
                                !formData.date &&
                                  "text-muted-foreground dark:text-slate-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                              <span className="truncate">
                                {formData.date ? (
                                  format(formData.date, "PPP", { locale })
                                ) : (
                                  <span>{t.chooseDatePlaceholder}</span>
                                )}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-white dark:bg-gray-800 shadow-2xl dark:shadow-gray-900/50 border-0 rounded-2xl"
                            align="start"
                            sideOffset={5}
                          >
                            <Calendar
                              mode="single"
                              selected={formData.date}
                              onSelect={(date) =>
                                setFormData((prev) => ({ ...prev, date }))
                              }
                              initialFocus
                              className="pointer-events-auto rounded-2xl dark:bg-gray-800 dark:text-slate-100"
                              locale={locale}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label
                          htmlFor="time"
                          className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {t.time}
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-[13px] text-slate-400 dark:text-slate-500 h-4 w-4 z-10" />
                          <Input
                            id="time"
                            type="time"
                            value={formData.time}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Validate 24-hour format
                              if (
                                /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)
                              ) {
                                setFormData((prev) => ({
                                  ...prev,
                                  time: value,
                                }));
                              }
                            }}
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20 rounded-xl bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
                            required
                            pattern="[0-9]{2}:[0-9]{2}"
                            min="00:00"
                            max="23:59"
                            step="300" // 5-minute intervals
                          />
                          <small className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                            Format: 24h (00:00 - 23:59)
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t.status}
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: AppointmentStatus) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="w-full py-2.5 sm:py-3 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20 rounded-xl bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(formData.status)}
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                          <SelectItem value="arrive" className="rounded-lg">
                            <div className="flex items-center gap-2 py-1">
                              <Badge className="bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">
                                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                                {t.arrive}
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="termine" className="rounded-lg">
                            <div className="flex items-center gap-2 py-1">
                              <Badge className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                {t.termine}
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="reprogramme"
                            className="rounded-lg"
                          >
                            <div className="flex items-center gap-2 py-1">
                              <Badge className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {t.reprogramme}
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="confirme" className="rounded-lg">
                            <div className="flex items-center gap-2 py-1">
                              <Badge className="bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                {t.confirme}
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-700">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-xl border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors duration-200"
                        disabled={isLoading}
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? t.loading
                          : editingAppointment
                          ? t.edit
                          : t.create}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4 lg:gap-5 xl:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.02] group">
          <CardContent className="p-4 lg:p-5 xl:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-600 text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                  {t.total}
                </p>
                <p className="text-2xl lg:text-3xl xl:text-3xl font-bold text-blue-700 mt-1 lg:mt-2">
                  {stats.total}
                </p>
              </div>
             
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.02] group">
          <CardContent className="p-4 lg:p-5 xl:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-yellow-600 text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                  {t.arrive}
                </p>
                <p className="text-2xl lg:text-3xl xl:text-3xl font-bold text-yellow-700 mt-1 lg:mt-2">
                  {stats.arrive}
                </p>
              </div>
           
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.02] group">
          <CardContent className="p-4 lg:p-5 xl:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-600 text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                  {t.termine}
                </p>
                <p className="text-2xl lg:text-3xl xl:text-3xl font-bold text-green-700 mt-1 lg:mt-2">
                  {stats.termine}
                </p>
              </div>
            
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.02] group">
          <CardContent className="p-4 lg:p-5 xl:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-600 text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                  {t.reprogramme}
                </p>
                <p className="text-2xl lg:text-3xl xl:text-3xl font-bold text-blue-700 mt-1 lg:mt-2">
                  {stats.reprogramme}
                </p>
              </div>
             
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.02] group">
          <CardContent className="p-4 lg:p-5 xl:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-purple-600 text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                  {t.confirme}
                </p>
                <p className="text-2xl lg:text-3xl xl:text-3xl font-bold text-purple-700 mt-1 lg:mt-2">
                  {stats.confirme}
                </p>
              </div>
             
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.02] group">
          <CardContent className="p-4 lg:p-5 xl:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-indigo-600 text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                  {t.today}
                </p>
                <p className="text-2xl lg:text-3xl xl:text-3xl font-bold text-indigo-700 mt-1 lg:mt-2">
                  {stats.today}
                </p>
              </div>
            
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Message for Remaining Appointments */}
      {remainingAppointments !== null &&
        remainingAppointments < 10 &&
        remainingAppointments !== Infinity && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span>
              {remainingAppointments === 0
                ? t.errors.subscriptionLimit.description
                : `${remainingAppointments} rendez-vous restants ce mois-ci`}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
              onClick={() => (window.location.href = "/admin")}
            >
              Upgrade
            </Button>
          </div>
        )}

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Search and Status Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Input - Takes more space */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10">
                <Search className="h-5 w-5" />
              </div>
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3",
                  "min-h-[2.75rem]",
                  "bg-white dark:bg-gray-800",
                  "border border-slate-200 dark:border-slate-700",
                  "focus:border-primary focus:ring-primary/20/20",
                  "rounded-xl",
                  "text-slate-900 dark:text-slate-100",
                  "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  "text-base"
                )}
              />
            </div>

            {/* Status Filter - Fixed width on larger screens */}
            <div className="w-full sm:w-64 flex-shrink-0">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger
                  className={cn(
                    "w-full min-h-[2.75rem] px-3",
                    "bg-white dark:bg-gray-800",
                    "border border-slate-200 dark:border-slate-700",
                    "focus:border-primary focus:ring-primary/20/20",
                    "rounded-xl",
                    "text-slate-900 dark:text-slate-100"
                  )}
                >
                  <SelectValue placeholder={t.filterByStatus} />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm"
                  position="popper"
                  sideOffset={4}
                >
                  <SelectItem value="all" className="rounded-lg py-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                        {t.allStatuses}
                      </Badge>
                    </div>
                  </SelectItem>
                  {["arrive", "termine", "reprogramme", "confirme"].map(
                    (status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="rounded-lg py-2"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status)}
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Days Filter */}
          <div className="w-full overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              <Button
                variant="ghost"
                className={cn(
                  "px-4 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap",
                  filterDay === "all"
                    ? "bg-primary text-white shadow-lg hover:bg-primary/90"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
                onClick={() => setFilterDay("all")}
              >
                {t.allDays}
              </Button>
              {daysMapping.map((day) => (
                <Button
                  key={day.value}
                  variant="ghost"
                  className={cn(
                    "px-4 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap",
                    filterDay === day.value
                      ? "bg-primary text-white shadow-lg hover:bg-primary/90"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                  onClick={() => setFilterDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm font-medium">
            <span className="text-primary dark:text-primary/80">
              {filteredAppointments.length}
            </span>{" "}
            <span className="text-slate-600 dark:text-slate-400">
              {filteredAppointments.length === 1
                ? t.appointmentsFound
                : t.appointmentsFoundPlural}
            </span>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-lg dark:shadow-gray-900/30 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl mb-6">
                <CalendarIcon className="h-12 w-12 text-slate-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-gray-300 mb-2">
                {t.noAppointmentsFound}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-center max-w-md">
                {searchTerm || filterStatus !== "all" || filterDay !== "all"
                  ? t.searchMessage
                  : t.noAppointmentsMessage}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment, index) => (
            <Card
              key={appointment.id}
              className="bg-card/80 dark:bg-card/20 backdrop-blur-sm border-border/50 dark:border-border/10 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Status Indicator */}
                  <div
                    className={cn(
                      "h-1 sm:h-auto sm:w-2 flex-shrink-0",
                      appointment.status === "arrive" &&
                        "bg-gradient-to-b from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500",
                      appointment.status === "termine" &&
                        "bg-gradient-to-b from-green-500 to-green-600 dark:from-green-400 dark:to-green-500",
                      appointment.status === "reprogramme" &&
                        "bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500",
                      appointment.status === "confirme" &&
                        "bg-gradient-to-b from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500"
                    )}
                  />

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      {/* Patient Info */}
                      <div className="space-y-4 flex-1 w-full">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-xl">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {appointment.patientName}
                            </h3>
                            <div className="mt-1">
                              {getStatusBadge(appointment.status)}
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 bg-background/50 dark:bg-background/10 p-3 rounded-xl">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground font-medium truncate">
                              {appointment.phoneNumber}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 bg-background/50 dark:bg-background/10 p-3 rounded-xl">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground font-medium truncate">
                              {format(appointment.date, "dd/MM/yyyy", {
                                locale,
                              })}{" "}
                              à {appointment.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 bg-background/50 dark:bg-background/10 p-3 rounded-xl">
                            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground font-medium truncate">
                              {appointment.objective}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                        {/* Status Change Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 px-3 border-border hover:border-primary hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300"
                            >
                              {t.statusMenu}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="rounded-xl border-border/50 shadow-xl bg-card/95 dark:bg-card/80 backdrop-blur-sm">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "arrive")
                              }
                              className="rounded-lg cursor-pointer"
                              disabled={appointment.status === "arrive"}
                            >
                              <PlayCircle className="h-4 w-4 mr-2 text-yellow-500" />
                              {t.markAsArrived}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "termine")
                              }
                              className="rounded-lg cursor-pointer"
                              disabled={appointment.status === "termine"}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              {t.markAsFinished}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  appointment.id,
                                  "reprogramme"
                                )
                              }
                              className="rounded-lg cursor-pointer"
                              disabled={appointment.status === "reprogramme"}
                            >
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              {t.markAsRescheduled}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "confirme")
                              }
                              className="rounded-lg cursor-pointer"
                              disabled={appointment.status === "confirme"}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                              {t.markAsConfirmed}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(appointment)}
                          className="h-10 w-10 p-0 border-border hover:border-primary hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(appointment.id)}
                          className="h-10 w-10 p-0 border-border hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-500 rounded-xl transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Appointments;
