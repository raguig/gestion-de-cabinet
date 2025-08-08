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

interface Appointment {
  id: string;
  patientName: string;
  phoneNumber: string;
  objective: string;
  date: Date;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
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
    phonePlaceholder: "06 12 34 56 78",
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
    },
    success: {
      appointmentCreated: "Rendez-vous créé avec succès",
      appointmentUpdated: "Rendez-vous modifié avec succès",
      appointmentDeleted: "Le rendez-vous a été supprimé avec succès",
      statusUpdated: "Statut mis à jour",
      statusScheduled: "Le rendez-vous a été marqué comme planifié",
      statusCompleted: "Le rendez-vous a été marqué comme terminé",
      statusCancelled: "Le rendez-vous a été marqué comme annulé",
    },
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
    phonePlaceholder: "06 12 34 56 78",
    objectivePlaceholder: "Describe the consultation objective...",
    errors: {
      allFieldsRequired: "Please fill in all fields",
      mustBeLoggedIn: "You must be logged in",
      loginRequired: "You must be logged in to view appointments",
      loadError: "Unable to load appointments",
      deleteError: "An error occurred during deletion",
      statusUpdateError: "An error occurred while updating the status",
      genericError: "An error occurred",
    },
    success: {
      appointmentCreated: "Appointment created successfully",
      appointmentUpdated: "Appointment updated successfully",
      appointmentDeleted: "Appointment deleted successfully",
      statusUpdated: "Status updated",
      statusScheduled: "Appointment marked as scheduled",
      statusCompleted: "Appointment marked as completed",
      statusCancelled: "Appointment marked as cancelled",
    },
  },
};

const Appointments = () => {
  const { language } = useLanguage();

  const t = translations[language];

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    objective: "",
    date: undefined as Date | undefined,
    time: "",
    status: "scheduled" as "scheduled" | "completed" | "cancelled",
  });

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
        "http://localhost:8000/api/appointments",
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
        status: appointment.status || "scheduled",
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

  useEffect(() => {
    fetchAppointments();
  }, []);

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

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, filterStatus]);

  const resetForm = () => {
    setFormData({
      patientName: "",
      phoneNumber: "",
      objective: "",
      date: undefined,
      time: "",
      status: "scheduled",
    });
    setEditingAppointment(null);
  };

  const handleSubmit = async () => {
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
          `http://localhost:8000/api/appointments/${editingAppointment.id}`,
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
          "http://localhost:8000/api/appointments",
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
     
      toast({
        title: "Erreur",
        description: error.response?.data?.message || t.errors.genericError,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    newStatus: "scheduled" | "completed" | "cancelled"
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
        `http://localhost:8000/api/appointments/${appointmentId}`,
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
        scheduled: t.success.statusScheduled,
        completed: t.success.statusCompleted,
        cancelled: t.success.statusCancelled,
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
      scheduled: {
        className:
          "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800",
        icon: PlayCircle,
        label: t.scheduled,
      },
      completed: {
        className:
          "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800",
        icon: CheckCircle,
        label: t.completed,
      },
      cancelled: {
        className:
          "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-800",
        icon: XCircle,
        label: t.cancelled,
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
    const scheduled = appointments.filter(
      (apt) => apt.status === "scheduled"
    ).length;
    const completed = appointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const cancelled = appointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;
    const today = appointments.filter((apt) => {
      const appointmentDate = new Date(apt.date);
      return appointmentDate.toDateString() === new Date().toDateString();
    }).length;

    return { total, scheduled, completed, cancelled, today };
  };

  const stats = getStatsData();
  const locale = language === "fr" ? fr : enUS;

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-10"></div>
        <div className="relative bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Toggle */}

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg rounded-2xl">
                    <Plus className="h-5 w-5 mr-2" />
                    {t.newAppointment}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
                  <DialogHeader className="pb-6">
                    <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {editingAppointment
                        ? t.editAppointment
                        : t.newAppointment}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="patientName"
                          className="text-sm font-semibold text-slate-700"
                        >
                          {t.patientName}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <Input
                            id="patientName"
                            value={formData.patientName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                patientName: e.target.value,
                              }))
                            }
                            placeholder={t.patientNamePlaceholder}
                            className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="phoneNumber"
                          className="text-sm font-semibold text-slate-700"
                        >
                          {t.phoneNumber}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <Input
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                phoneNumber: e.target.value,
                              }))
                            }
                            placeholder={t.phonePlaceholder}
                            className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="objective"
                        className="text-sm font-semibold text-slate-700"
                      >
                        {t.consultationObjective}
                      </Label>
                      <div className="relative">
                        <Target className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
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
                          className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t.date}
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal rounded-xl",
                                "border-slate-200 dark:border-slate-700",
                                "bg-white dark:bg-gray-800",
                                "hover:border-blue-500 dark:hover:border-blue-400",
                                "text-slate-900 dark:text-slate-100",
                                !formData.date &&
                                  "text-muted-foreground dark:text-slate-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                              {formData.date ? (
                                format(formData.date, "PPP", { locale })
                              ) : (
                                <span>{t.chooseDatePlaceholder}</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-white dark:bg-gray-800 shadow-2xl dark:shadow-gray-900/50 border-0 rounded-2xl"
                            align="start"
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

                      <div className="space-y-3">
                        <Label
                          htmlFor="time"
                          className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                        >
                          {t.time}
                        </Label>
                        <div
                          className="relative group cursor-pointer"
                          onClick={() =>
                            document.getElementById("time")?.showPicker?.()
                          }
                        >
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-400 h-4 w-4 pointer-events-none z-10" />
                          <Input
                            id="time"
                            type="time"
                            value={formData.time}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                time: e.target.value,
                              }))
                            }
                            className={cn(
                              "pl-10 rounded-xl w-full cursor-pointer",
                              "border-slate-200 dark:border-slate-700",
                              "hover:border-slate-300 dark:hover:border-slate-600",
                              "focus:border-primary dark:focus:border-primary",
                              "focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20",
                              "bg-white dark:bg-gray-800",
                              "text-slate-900 dark:text-slate-100",
                              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                              "[&::-webkit-calendar-picker-indicator]:dark:invert",
                              "[&::-webkit-calendar-picker-indicator]:opacity-0",
                              "[&::-webkit-calendar-picker-indicator]:absolute",
                              "[&::-webkit-calendar-picker-indicator]:left-0",
                              "[&::-webkit-calendar-picker-indicator]:right-0",
                              "[&::-webkit-calendar-picker-indicator]:bottom-0",
                              "[&::-webkit-calendar-picker-indicator]:top-0",
                              "[&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            )}
                            style={{
                              colorScheme:
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? "dark"
                                  : "light",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700">
                        {t.status}
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(
                          value: "scheduled" | "completed" | "cancelled"
                        ) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                          <SelectItem value="scheduled" className="rounded-lg">
                            <div className="flex items-center">
                              <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                              {t.scheduled}
                            </div>
                          </SelectItem>
                          <SelectItem value="completed" className="rounded-lg">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              {t.completed}
                            </div>
                          </SelectItem>
                          <SelectItem value="cancelled" className="rounded-lg">
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2 text-red-600" />
                              {t.cancelled}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="px-8 py-2 rounded-xl border-slate-200 hover:bg-slate-50"
                        disabled={isLoading}
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                  {t.total}
                </p>
                <p className="text-3xl font-bold text-blue-700">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-semibold uppercase tracking-wide">
                  {t.scheduled_plural}
                </p>
                <p className="text-3xl font-bold text-orange-700">
                  {stats.scheduled}
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-xl">
                <PlayCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">
                  {t.completed_plural}
                </p>
                <p className="text-3xl font-bold text-green-700">
                  {stats.completed}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-semibold uppercase tracking-wide">
                  {t.cancelled_plural}
                </p>
                <p className="text-3xl font-bold text-red-700">
                  {stats.cancelled}
                </p>
              </div>
              <div className="bg-red-200 p-3 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">
                  {t.today}
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {stats.today}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 border-border focus:border-primary focus:ring-primary/20 rounded-xl text-foreground bg-background/50 dark:bg-background/5 placeholder:text-muted-foreground"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-64 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/50">
              <SelectValue placeholder={t.filterByStatus} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <SelectItem value="all" className="rounded-lg">
                {t.allStatuses}
              </SelectItem>
              <SelectItem value="scheduled" className="rounded-lg">
                {t.scheduled_plural}
              </SelectItem>
              <SelectItem value="completed" className="rounded-lg">
                {t.completed_plural}
              </SelectItem>
              <SelectItem value="cancelled" className="rounded-lg">
                {t.cancelled_plural}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600 font-medium">
            {filteredAppointments.length}{" "}
            {filteredAppointments.length === 1
              ? t.appointmentsFound
              : t.appointmentsFoundPlural}
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
                {searchTerm || filterStatus !== "all"
                  ? t.searchMessage
                  : t.noAppointmentsMessage}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment, index) => (
            <Card
              key={appointment.id}
              className="bg-card/80 dark:bg-card/20 backdrop-blur-sm border-border/50 dark:border-border/10 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Status Indicator */}
                  <div
                    className={cn(
                      "w-2 flex-shrink-0",
                      appointment.status === "scheduled" &&
                        "bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500",
                      appointment.status === "completed" &&
                        "bg-gradient-to-b from-green-500 to-green-600 dark:from-green-400 dark:to-green-500",
                      appointment.status === "cancelled" &&
                        "bg-gradient-to-b from-red-500 to-red-600 dark:from-red-400 dark:to-red-500"
                    )}
                  />

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4 flex-1">
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 bg-background/50 dark:bg-background/10 p-3 rounded-xl">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground font-medium">
                              {appointment.phoneNumber}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 bg-background/50 dark:bg-background/10 p-3 rounded-xl">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground font-medium">
                              {format(appointment.date, "dd/MM/yyyy", {
                                locale,
                              })}{" "}
                              à {appointment.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 bg-background/50 dark:bg-background/10 p-3 rounded-xl lg:col-span-1">
                            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground font-medium truncate">
                              {appointment.objective}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-6">
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
                                handleStatusChange(appointment.id, "scheduled")
                              }
                              className="rounded-lg cursor-pointer"
                              disabled={appointment.status === "scheduled"}
                            >
                              <PlayCircle className="h-4 w-4 mr-2 text-blue-500" />
                              {t.markAsScheduled}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "completed")
                              }
                              className="rounded-lg cursor-pointer"
                              disabled={appointment.status === "completed"}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              {t.markAsCompleted}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "cancelled")
                              }
                              className="rounded-lg cursor-pointer"
                              disabled={appointment.status === "cancelled"}
                            >
                              <XCircle className="h-4 w-4 mr-2 text-red-500" />
                              {t.markAsCancelled}
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
