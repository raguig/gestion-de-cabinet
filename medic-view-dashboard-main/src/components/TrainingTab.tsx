import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import html2canvas from 'html2canvas';

interface Patient {
  sex: string;
  nom?: string;
  prenom?: string;
}

interface TrainingTabProps {
  patient: Patient;
  visitId: string;
  onTrainingAssigned?: () => void;
  hasTraining?: boolean;
  language?: "fr" | "en"; // Add this line
}
interface Exercise {
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  note?: string;
}

interface TrainingDay {
  title: string;
  exercises: Exercise[];
}

interface SpecializedDay {
  title: string;
  exercises: Exercise[];
  day?: string; // Add these optional fields
  session?: string;
  objective?: string;
  duration?: string;
}

// Add this interface at the top with other interfaces
interface AssignedTraining {
  type: string;
  level: string;
  equipment: string[];
  exercises: {
    day: string;
    title: string;
    workouts: {
      name: string;
      sets: number;
      reps: string;
      duration?: string;
      note?: string;
    }[];
  }[];
}

export default function TrainingTab({
  patient,
  visitId,
  onTrainingAssigned,
  hasTraining = false,
  language = "fr" // Add language prop with default value
}: TrainingTabProps) {
  const [trainingType, setTrainingType] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState("");

  const [generatedProgram, setGeneratedProgram] = useState<
    TrainingDay[] | SpecializedDay[]
  >([]);
  const [languageState, setLanguage] = useState("fr"); // Default to French

  const [isSpecialized, setIsSpecialized] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<
    TrainingDay[] | SpecializedDay[]
  >();


const translations = {
  fr: {
    title: "Assigner un entraînement",
    male: "Homme",
    female: "Femme",
    trainingType: "Type d'entraînement",
    selectType: "Sélectionner un type",
    equipment: "Matériel disponible",
    equipmentHelper: "Sélectionnez le matériel disponible pour",
    activityLevel: "Niveau d'activité",
    previewTitle: "Aperçu du programme",
    previewEmpty: "Sélectionnez les paramètres pour voir le programme",
    moreExercises: "et {count} exercices de plus",
    assignButton: "Assigner ce programme d'entraînement",
    fillFields: "Remplissez tous les champs pour voir l'aperçu",
    coloredVersion: "Version colorée",
    bwVersion: "Version N&B",
    duration: "Durée",
    alreadyAssigned: "Un programme d'entraînement est déjà assigné. Veuillez d'abord le supprimer avant d'en assigner un nouveau.",
    programAssigned: "Programme d'entraînement assigné. Téléchargez votre programme dans le format souhaité.",
    pdfModal: {
      title: "Choisissez le style de PDF",
      coloredStyle: "Style Coloré",
      coloredDesc: "Version moderne avec mise en page colorée",
      bwStyle: "Style Noir et Blanc",
      bwDesc: "Version simple et imprimable",
      cancel: "Annuler"
    },
    trainingTypes: {
      musculation: "Musculation",
      wellness: "Sports de bien-être"
    },
        selectParamsForPreview: "Sélectionnez les paramètres et cliquez sur \"Générer\" pour voir le programme",

    wellness: {
      yoga: "Yoga",
      pilates: "Pilates", 
      taichi: "Tai-chi",
      qigong: "Qi Gong",
      stretching: "Stretching",
      karate: "Karaté",
      boxing: "Boxe",
      taekwondo: "Taekwondo", 
      judo: "Judo",
      kungfu: "Kung-Fu / Wushu",
      jujitsu: "Ju-jitsu"
    },
    activityLevels: {
      beginner: "débutant",
      intermediate: "intermédiaire",
      advanced: "avancé"
    }
  },
  en: {
    title: "Assign Training",
    male: "Male",
    female: "Female",
    trainingType: "Training Type",
    selectType: "Select a type",
    equipment: "Available Equipment",
    equipmentHelper: "Select available equipment for",
    activityLevel: "Activity Level",
    previewTitle: "Program Preview",
    previewEmpty: "Select parameters to see the program",
    moreExercises: "and {count} more exercises",
    assignButton: "Assign this training program",
    fillFields: "Fill in all fields to see preview",
    coloredVersion: "Colored version",
    bwVersion: "B&W version",
    duration: "Duration",
    alreadyAssigned: "A training plan is already assigned. Please delete it first before assigning a new one.",
    programAssigned: "Training program assigned. Download your program in your preferred format.",
    pdfModal: {
      title: "Choose PDF style",
      coloredStyle: "Colored Style",
      coloredDesc: "Modern version with colored layout",
      bwStyle: "Black and White Style",
      bwDesc: "Simple, printer-friendly version",
      cancel: "Cancel"
    },
    trainingTypes: {
      musculation: "Weight Training",
      wellness: "Wellness Sports"
    },
        selectParamsForPreview: "Select parameters and click \"Generate\" to see the program",

   wellness: {
  yoga: "Yoga",
  pilates: "Pilates", 
  taichi: "Tai-chi",
  qigong: "Qi Gong",
  stretching: "Stretching",
  karate: "Karate",
  boxing: "Boxing",
  taekwondo: "Taekwondo", 
  judo: "Judo",
  kungfu: "Kung-Fu / Wushu",
  jujitsu: "Ju-jitsu"
},
    activityLevels: {
      beginner: "beginner",
      intermediate: "intermediate",
      advanced: "advanced"
    }
  }
};

// Helper function to get translation
const getTranslation = (key: string, lang: string) => {
  const keys = key.split('.');
  let value = translations[lang as keyof typeof translations];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key;
    }
  }
  
  return value as string;
};


  // Add this state to store the assigned training data
  const [assignedTraining, setAssignedTraining] = useState<AssignedTraining | null>(null);

  const trainingTypeEquipment: Record<string, string[]> = {
  // French version
  [translations.fr.trainingTypes.musculation]: [
    "haltères et machines",
    "poids du corps et bandes élastiques",
  ],
  [translations.fr.trainingTypes.wellness]: [
    translations.fr.wellness.yoga,
    translations.fr.wellness.pilates,
    translations.fr.wellness.taichi,
    translations.fr.wellness.qigong,
    translations.fr.wellness.stretching,
    translations.fr.wellness.karate,
    translations.fr.wellness.boxing,
    translations.fr.wellness.taekwondo,
    translations.fr.wellness.judo,
    translations.fr.wellness.kungfu,
    translations.fr.wellness.jujitsu,
  ],
  // English version
  [translations.en.trainingTypes.musculation]: [
    "weights and machines",
    "bodyweight and resistance bands",
  ],
  [translations.en.trainingTypes.wellness]: [
    translations.en.wellness.yoga,
    translations.en.wellness.pilates,
    translations.en.wellness.taichi,
    translations.en.wellness.qigong,
    translations.en.wellness.stretching,
    translations.en.wellness.karate,
    translations.en.wellness.boxing,
    translations.en.wellness.taekwondo,
    translations.en.wellness.judo,
    translations.en.wellness.kungfu,
    translations.en.wellness.jujitsu,
  ]
};

  // Update trainingTypes array
  const trainingTypes = [
    translations[language].trainingTypes.musculation,
    translations[language].trainingTypes.wellness
  ];

  // Update activityLevels array
  const activityLevels = [
    translations[language].activityLevels.beginner,
    translations[language].activityLevels.intermediate,
    translations[language].activityLevels.advanced
  ];

  const equipmentOptions = [
    "haltères et machines",
    "poids du corps et bandes élastiques",
    "Yoga",
    "Pilates",
    "Tai-chi",
    "Qi Gong",
    "Stretching",
    "Karate",
    "Boxe",
    "Taekwondo",
    "Judo",
    "Kung-Fu / Wushu",
    "Ju-jitsu",
  ];
  const activityLevelsStatic = ["débutant", "intermédiaire", "avancé"];
  // Specialized programs (same for both genders)
  const generateSpecializedProgram = (type: string): SpecializedDay[] => {
    const programs = {
      Yoga: [
        {
          title: "Lundi – Hatha Yoga Doux",
          day: "Lundi",
          session: "Hatha Yoga Doux",
          objective: "Éveil du corps, respiration",
          duration: "30-45 min",
          exercises: [
            {
              name: "Éveil du corps, respiration",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Mardi – Vinyasa Flow Débutant",
          day: "Mardi",
          session: "Vinyasa Flow Débutant",
          objective: "Renforcement doux, mobilité",
          duration: "30-45 min",
          exercises: [
            {
              name: "Renforcement doux, mobilité",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Mercredi – Yoga pour le dos et la posture",
          day: "Mercredi",
          session: "Yoga pour le dos et la posture",
          objective: "Soulager tensions, redresser la posture",
          duration: "30-45 min",
          exercises: [
            {
              name: "Soulager tensions, redresser la posture",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Jeudi – Yin Yoga",
          day: "Jeudi",
          session: "Yin Yoga",
          objective: "Étirement profond, relâchement",
          duration: "30-45 min",
          exercises: [
            {
              name: "Étirement profond, relâchement",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Vendredi – Power Yoga léger",
          day: "Vendredi",
          session: "Power Yoga léger",
          objective: "Tonification douce, équilibre",
          duration: "30-45 min",
          exercises: [
            {
              name: "Tonification douce, équilibre",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Samedi – (Optionnel) Méditation + Pranayama",
          day: "Samedi",
          session: "Méditation + Pranayama",
          objective: "Calme mental, contrôle du souffle",
          duration: "30-45 min",
          exercises: [
            {
              name: "Calme mental, contrôle du souffle",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Dimanche – Repos ou balade en conscience",
          day: "Dimanche",
          session: "Repos ou balade en conscience",
          objective: "Récupération active",
          duration: "30-45 min",
          exercises: [
            {
              name: "Récupération active",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
      ],
      Pilates: [
        {
          title: "Lundi – Pilates de base – Centre & respiration",
          day: "Lundi",
          session: "Pilates de base",
          objective: "Renforcement du « core », contrôle du souffle",
          duration: "30-45 min",
          exercises: [
            {
              name: "Renforcement du « core », contrôle du souffle",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Mardi – Pilates bas du corps",
          day: "Mardi",
          session: "Pilates bas du corps",
          objective: "Cuisses, fessiers, stabilité pelvienne",
          duration: "30-45 min",
          exercises: [
            {
              name: "Cuisses, fessiers, stabilité pelvienne",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Mercredi – Stretching & mobilité en Pilates",
          day: "Mercredi",
          session: "Stretching & mobilité",
          objective: "Étirements actifs, mobilité articulaire",
          duration: "30-45 min",
          exercises: [
            {
              name: "Étirements actifs, mobilité articulaire",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Jeudi – Pilates haut du corps & posture",
          day: "Jeudi",
          session: "Pilates haut du corps",
          objective: "Épaules, dos, bras, posture",
          duration: "30-45 min",
          exercises: [
            {
              name: "Épaules, dos, bras, posture",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Vendredi – Pilates complet + gainage",
          day: "Vendredi",
          session: "Pilates complet",
          objective: "Travail global, ceinture abdominale",
          duration: "30-45 min",
          exercises: [
            {
              name: "Travail global, ceinture abdominale",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Samedi – (optionnel) Routine douce avec ballon",
          day: "Samedi",
          session: "Routine douce avec ballon",
          objective: "Stabilité et contrôle",
          duration: "30-45 min",
          exercises: [
            {
              name: "Stabilité et contrôle",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Dimanche – Repos actif ou marche consciente",
          day: "Dimanche",
          session: "Repos actif ou marche consciente",
          objective: "Récupération et détente",
          duration: "30-45 min",
          exercises: [
            {
              name: "Récupération et détente",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
      ],
      Karate: [
        {
          title: "Lundi – Kihon (techniques de base)",
          day: "Lundi",
          session: "Kihon",
          objective: "Apprentissage des coups de poing, blocages, positions",
          duration: "30-45 min",
          exercises: [
            {
              name: "Apprentissage des coups de poing, blocages, positions",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Mardi – Enchaînements + déplacements (Kihon Waza)",
          day: "Mardi",
          session: "Kihon Waza",
          objective: "Coordination, équilibre, enchaînements fluides",
          duration: "30-45 min",
          exercises: [
            {
              name: "Coordination, équilibre, enchaînements fluides",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Mercredi – Kata de base (ex. : Heian Shodan)",
          day: "Mercredi",
          session: "Kata de base",
          objective: "Mémorisation, précision, respiration",
          duration: "30-45 min",
          exercises: [
            {
              name: "Mémorisation, précision, respiration",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Jeudi – Kumite sans contact (combat simulé)",
          day: "Jeudi",
          session: "Kumite sans contact",
          objective: "Vitesse, distance, timing, respect",
          duration: "30-45 min",
          exercises: [
            {
              name: "Vitesse, distance, timing, respect",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Vendredi – Renforcement + souplesse spécifique",
          day: "Vendredi",
          session: "Renforcement et souplesse",
          objective: "Gainage, jambes, étirements, explosivité",
          duration: "30-45 min",
          exercises: [
            {
              name: "Gainage, jambes, étirements, explosivité",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Samedi – Révision libre + shadow karaté",
          day: "Samedi",
          session: "Révision libre",
          objective: "Maîtrise personnelle",
          duration: "30-45 min",
          exercises: [
            {
              name: "Maîtrise personnelle",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
        {
          title: "Dimanche – Repos ou méditation Zen",
          day: "Dimanche",
          session: "Repos ou méditation Zen",
          objective: "Esprit du karaté, recentrage",
          duration: "30-45 min",
          exercises: [
            {
              name: "Esprit du karaté, recentrage",
              sets: 0,
              reps: "",
              duration: "30-45 min",
            },
          ],
        },
      ],
      "Tai-chi": [
        {
          title: "Lundi – Postures de base + respiration consciente",
          day: "Lundi",
          session: "Postures de base",
          objective: "Ancrage, conscience du souffle",
          duration: "20-30 min",
          exercises: [
            {
              name: "Ancrage, conscience du souffle",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Mardi – Enchaînement 'Forme 8' (forme courte)",
          day: "Mardi",
          session: "Forme 8",
          objective: "Fluidité, mémorisation des gestes simples",
          duration: "20-30 min",
          exercises: [
            {
              name: "Fluidité, mémorisation des gestes simples",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Mercredi – Mouvement lent + ancrage dans le sol",
          day: "Mercredi",
          session: "Mouvement lent",
          objective: "Équilibre, mobilité articulaire",
          duration: "20-30 min",
          exercises: [
            {
              name: "Équilibre, mobilité articulaire",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Jeudi – Application martiale lente (Tai-Chi Chuan)",
          day: "Jeudi",
          session: "Application martiale lente",
          objective: "Concentration, gestuelle maîtrisée",
          duration: "20-30 min",
          exercises: [
            {
              name: "Concentration, gestuelle maîtrisée",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Vendredi – Forme complète + Qi Gong d'éveil",
          day: "Vendredi",
          session: "Forme complète",
          objective: "Circulation énergétique, sérénité mentale",
          duration: "20-30 min",
          exercises: [
            {
              name: "Circulation énergétique, sérénité mentale",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Samedi – (Optionnel) Tai-Chi méditatif en plein air",
          day: "Samedi",
          session: "Tai-Chi méditatif",
          objective: "Méditation en mouvement, apaisement",
          duration: "20-30 min",
          exercises: [
            {
              name: "Méditation en mouvement, apaisement",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Dimanche – Repos ou marche lente consciente",
          day: "Dimanche",
          session: "Repos ou marche lente consciente",
          objective: "Récupération naturelle",
          duration: "20-30 min",
          exercises: [
            {
              name: "Récupération naturelle",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
      ],
      "Qi Gong": [
        {
          title: "Lundi – Échauffement énergétique + 8 pièces de Brocart",
          day: "Lundi",
          session: "Échauffement + 8 pièces de Brocart",
          objective: "Éveil du corps, tonification des organes",
          duration: "20-30 min",
          exercises: [
            {
              name: "Éveil du corps, tonification des organes",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Mardi – Qi Gong des 5 animaux (Wu Qin Xi) – partie 1",
          day: "Mardi",
          session: "Qi Gong des 5 animaux - partie 1",
          objective: "Mobilité, fluidité, activation douce",
          duration: "20-30 min",
          exercises: [
            {
              name: "Mobilité, fluidité, activation douce",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Mercredi – Respiration abdominale + mouvements statiques",
          day: "Mercredi",
          session: "Respiration abdominale",
          objective: "Détente du système nerveux, enracinement",
          duration: "20-30 min",
          exercises: [
            {
              name: "Détente du système nerveux, enracinement",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Jeudi – Qi Gong pour renforcer les reins et l'immunité",
          day: "Jeudi",
          session: "Qi Gong reins et immunité",
          objective: "Énergie vitale, longévité",
          duration: "20-30 min",
          exercises: [
            {
              name: "Énergie vitale, longévité",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Vendredi – Qi Gong des méridiens + automassages",
          day: "Vendredi",
          session: "Qi Gong des méridiens",
          objective: "Circulation énergétique, détente musculaire",
          duration: "20-30 min",
          exercises: [
            {
              name: "Circulation énergétique, détente musculaire",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Samedi – Qi Gong méditatif debout (Zhan Zhuang)",
          day: "Samedi",
          session: "Qi Gong méditatif debout",
          objective: "Concentration, ancrage, puissance interne",
          duration: "20-30 min",
          exercises: [
            {
              name: "Concentration, ancrage, puissance interne",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Dimanche – Marche Qi Gong lente ou repos",
          day: "Dimanche",
          session: "Marche Qi Gong lente ou repos",
          objective: "Récupération énergétique, conscience du souffle",
          duration: "20-30 min",
          exercises: [
            {
              name: "Récupération énergétique, conscience du souffle",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
      ],
      Stretching: [
        {
          title: "Lundi – Stretching global du corps (full body)",
          day: "Lundi",
          session: "Stretching global",
          objective: "Détente générale, allongement musculaire",
          duration: "20-30 min",
          exercises: [
            {
              name: "Détente générale, allongement musculaire",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Mardi – Étirements du bas du corps",
          day: "Mardi",
          session: "Étirements bas du corps",
          objective: "Fessiers, quadriceps, ischios, mollets",
          duration: "20-30 min",
          exercises: [
            {
              name: "Fessiers, quadriceps, ischios, mollets",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Mercredi – Étirements du haut du corps",
          day: "Mercredi",
          session: "Étirements haut du corps",
          objective: "Dos, épaules, nuque, bras",
          duration: "20-30 min",
          exercises: [
            {
              name: "Dos, épaules, nuque, bras",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Jeudi – Stretching actif + mobilité articulaire",
          day: "Jeudi",
          session: "Stretching actif",
          objective: "Souplesse dynamique, fluidité",
          duration: "20-30 min",
          exercises: [
            {
              name: "Souplesse dynamique, fluidité",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Vendredi – Stretching profond & relaxation",
          day: "Vendredi",
          session: "Stretching profond",
          objective: "Postures longues tenues (Yin-like)",
          duration: "20-30 min",
          exercises: [
            {
              name: "Postures longues tenues (Yin-like)",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
        {
          title: "Samedi – Stretching matinal 10-15 min",
          day: "Samedi",
          session: "Stretching matinal",
          objective: "Éveil musculaire en douceur",
          duration: "10-15 min",
          exercises: [
            {
              name: "Éveil musculaire en douceur",
              sets: 0,
              reps: "",
              duration: "10-15 min",
            },
          ],
        },
        {
          title: "Dimanche – Repos ou étirements libres",
          day: "Dimanche",
          session: "Repos ou étirements libres",
          objective: "Auto-écoute et libération corporelle",
          duration: "20-30 min",
          exercises: [
            {
              name: "Auto-écoute et libération corporelle",
              sets: 0,
              reps: "",
              duration: "20-30 min",
            },
          ],
        },
      ],
      Boxe: [
        {
          title: "Lundi – Cardio + shadow boxing",
          day: "Lundi",
          session: "Cardio + shadow boxing",
          objective: "Endurance cardiovasculaire et fluidité technique",
          duration: "45-60 min",
          exercises: [
            {
              name: "Endurance cardiovasculaire et fluidité technique",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mardi – Techniques de poings/pieds + sac de frappe",
          day: "Mardi",
          session: "Techniques de poings/pieds",
          objective: "Perfectionnement technique et puissance",
          duration: "45-60 min",
          exercises: [
            {
              name: "Perfectionnement technique et puissance",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mercredi – Renfo musculaire + gainage",
          day: "Mercredi",
          session: "Renfo musculaire + gainage",
          objective: "Renforcement global et stabilité",
          duration: "45-60 min",
          exercises: [
            {
              name: "Renforcement global et stabilité",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Jeudi – Sparring (léger ou simulation)",
          day: "Jeudi",
          session: "Sparring",
          objective: "Application technique et distance",
          duration: "45-60 min",
          exercises: [
            {
              name: "Application technique et distance",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Vendredi – Coordination + esquives + souplesse",
          day: "Vendredi",
          session: "Coordination + esquives",
          objective: "Agilité et défense",
          duration: "45-60 min",
          exercises: [
            {
              name: "Agilité et défense",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
      ],
      Taekwondo: [
        {
          title: "Lundi – Techniques de jambes (Chagi)",
          day: "Lundi",
          session: "Techniques de jambes",
          objective: "Maîtrise des coups de pied fondamentaux",
          duration: "45-60 min",
          exercises: [
            {
              name: "Maîtrise des coups de pied fondamentaux",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mardi – Séquences de combat + flexibilité",
          day: "Mardi",
          session: "Séquences de combat",
          objective: "Enchaînements et souplesse",
          duration: "45-60 min",
          exercises: [
            {
              name: "Enchaînements et souplesse",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mercredi – Poomsae (formes) + équilibre",
          day: "Mercredi",
          session: "Poomsae (formes)",
          objective: "Formes techniques et stabilité",
          duration: "45-60 min",
          exercises: [
            {
              name: "Formes techniques et stabilité",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Jeudi – Cardio + travail des réflexes",
          day: "Jeudi",
          session: "Cardio + travail des réflexes",
          objective: "Vitesse et réactivité",
          duration: "45-60 min",
          exercises: [
            {
              name: "Vitesse et réactivité",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Vendredi – Simulations de combat + renforcement jambes",
          day: "Vendredi",
          session: "Simulations de combat",
          objective: "Application combat et puissance",
          duration: "45-60 min",
          exercises: [
            {
              name: "Application combat et puissance",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
      ],
      Judo: [
        {
          title: "Lundi – Ukemi (chutes) + déplacements",
          day: "Lundi",
          session: "Ukemi + déplacements",
          objective: "Sécurité et mobilité de base",
          duration: "45-60 min",
          exercises: [
            {
              name: "Sécurité et mobilité de base",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mardi – Techniques de projection (nage waza)",
          day: "Mardi",
          session: "Techniques de projection",
          objective: "Maîtrise des projections fondamentales",
          duration: "45-60 min",
          exercises: [
            {
              name: "Maîtrise des projections fondamentales",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mercredi – Renforcement + gainage",
          day: "Mercredi",
          session: "Renforcement + gainage",
          objective: "Force fonctionnelle et stabilité",
          duration: "45-60 min",
          exercises: [
            {
              name: "Force fonctionnelle et stabilité",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Jeudi – Combat au sol (ne waza)",
          day: "Jeudi",
          session: "Combat au sol",
          objective: "Techniques de contrôle au sol",
          duration: "45-60 min",
          exercises: [
            {
              name: "Techniques de contrôle au sol",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Vendredi – Randori (combat libre contrôlé)",
          day: "Vendredi",
          session: "Randori",
          objective: "Application pratique des techniques",
          duration: "45-60 min",
          exercises: [
            {
              name: "Application pratique des techniques",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
      ],
      "Kung-Fu / Wushu": [
        {
          title: "Lundi – Postures + techniques de base",
          day: "Lundi",
          session: "Postures + techniques de base",
          objective: "Fondamentaux et alignement",
          duration: "45-60 min",
          exercises: [
            {
              name: "Fondamentaux et alignement",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mardi – Formes traditionnelles (taolu)",
          day: "Mardi",
          session: "Formes traditionnelles",
          objective: "Enchaînements codifiés",
          duration: "45-60 min",
          exercises: [
            {
              name: "Enchaînements codifiés",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mercredi – Souplesse + Qi Gong",
          day: "Mercredi",
          session: "Souplesse + Qi Gong",
          objective: "Mobilité et énergie interne",
          duration: "45-60 min",
          exercises: [
            {
              name: "Mobilité et énergie interne",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Jeudi – Sanda (combat avec règles)",
          day: "Jeudi",
          session: "Sanda",
          objective: "Application martiale",
          duration: "45-60 min",
          exercises: [
            {
              name: "Application martiale",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Vendredi – Enchaînements + saut + arme légère",
          day: "Vendredi",
          session: "Enchaînements + saut + arme légère",
          objective: "Techniques avancées selon niveau",
          duration: "45-60 min",
          exercises: [
            {
              name: "Techniques avancées selon niveau",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
      ],
      "Ju-jitsu": [
        {
          title: "Lundi – Mouvements au sol (escapes, gardes)",
          day: "Lundi",
          session: "Mouvements au sol",
          objective: "Défense et contrôle au sol",
          duration: "45-60 min",
          exercises: [
            {
              name: "Défense et contrôle au sol",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mardi – Techniques de soumission",
          day: "Mardi",
          session: "Techniques de soumission",
          objective: "Maîtrise des clés et étranglements",
          duration: "45-60 min",
          exercises: [
            {
              name: "Maîtrise des clés et étranglements",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Mercredi – Sparring technique",
          day: "Mercredi",
          session: "Sparring technique",
          objective: "Application contrôlée des techniques",
          duration: "45-60 min",
          exercises: [
            {
              name: "Application contrôlée des techniques",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Jeudi – Tactique en combat réel",
          day: "Jeudi",
          session: "Tactique en combat réel",
          objective: "Stratégie et adaptation",
          duration: "45-60 min",
          exercises: [
            {
              name: "Stratégie et adaptation",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
        {
          title: "Vendredi – Mobilité, respiration, récupération",
          day: "Vendredi",
          session: "Mobilité, respiration, récupération",
          objective: "Maintien et régénération",
          duration: "45-60 min",
          exercises: [
            {
              name: "Maintien et régénération",
              sets: 0,
              reps: "",
              duration: "45-60 min",
            },
          ],
        },
      ],
    };

    return programs[type as keyof typeof programs] || [];
  };

  // Male training programs
  const generateMaleProgram = (
    level: string,
    equipment: string[]
    
  ): TrainingDay[] => {
    const isWeightsMachines = equipment.includes("haltères et machines") || equipment.includes("weights and machines") ;
    const isBodyweightBands = equipment.includes(
      "poids du corps et bandes élastiques"
    ) || equipment.includes("bodyweight and resistance bands");

    if (isWeightsMachines) {
      switch (level) {
        case translations[language].activityLevels.beginner:
          return [
            {
              title: "Jour 1 – Haut du corps",
              exercises: [
                { name: "Chest press (machine)", sets: 4, reps: "8-12" },
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                {
                  name: "Développé épaules (machine ou haltères)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Curl biceps (haltères ou poulie basse)",
                  sets: 3,
                  reps: "10-12",
                },
                {
                  name: "Extension triceps à la poulie",
                  sets: 3,
                  reps: "10-12",
                },
              ],
            },
            {
              title: "Jour 2 – Bas du corps + abdos",
              exercises: [
                { name: "Leg press (machine)", sets: 4, reps: "10-15" },
                { name: "Leg curl (ischio) – machine", sets: 4, reps: "10-15" },
                {
                  name: "Extension mollets debout (machine)",
                  sets: 4,
                  reps: "12-20",
                },
                { name: "Crunchs au sol", sets: 3, reps: "20-25" },
                {
                  name: "Planche",
                  sets: 3,
                  reps: "",
                  duration: "30-60 secondes",
                },
              ],
            },
            {
              title: "Jour 3 – Full body",
              exercises: [
                { name: "Chest press (machine)", sets: 3, reps: "8-12" },
                { name: "Squat avec haltères", sets: 4, reps: "8-12" },
                { name: "Rowing un bras avec haltère", sets: 3, reps: "10-12" },
                { name: "Shoulder press (haltères)", sets: 3, reps: "8-12" },
                {
                  name: "Gainage (planche ou planche latérale)",
                  sets: 3,
                  reps: "15-20",
                  duration: "30-45 secondes",
                },
              ],
            },
          ];
        case translations[language].activityLevels.intermediate:
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                { name: "Chest press", sets: 4, reps: "8-12" },
                { name: "Écarté couché avec haltères", sets: 3, reps: "10-12" },
                { name: "Dips assistés", sets: 3, reps: "6-10" },
                { name: "Extension triceps poulie", sets: 3, reps: "10-12" },
                { name: "Kickback triceps (haltère)", sets: 3, reps: "12-15" },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                { name: "Tirage vertical (machine)", sets: 4, reps: "8-12" },
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                { name: "Curl biceps haltères", sets: 3, reps: "10-12" },
                { name: "Curl marteau (haltères)", sets: 3, reps: "10-12" },
                { name: "Curl poulie basse", sets: 3, reps: "12-15" },
              ],
            },
            {
              title: "Jour 3 – Jambes + Abdos",
              exercises: [
                { name: "Leg press", sets: 4, reps: "10-15" },
                { name: "Leg curl (machine)", sets: 4, reps: "10-12" },
                { name: "Fentes avec haltères", sets: 3, reps: "10 par jambe" },
                { name: "Crunch au sol ou machine", sets: 3, reps: "20-25" },
                { name: "Relevé de jambes suspendu", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 4 – Épaules + Full body",
              exercises: [
                { name: "Shoulder press", sets: 4, reps: "8-12" },
                { name: "Élévations latérales", sets: 3, reps: "10-12" },
                { name: "Élévations frontales", sets: 3, reps: "10-12" },
                { name: "Squats haltères", sets: 4, reps: "8-12" },
                {
                  name: "Planche (core)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
          ];
        case translations[language].activityLevels.advanced:
          return [
            {
              title: "Jour 1 – Poitrine",
              exercises: [
                { name: "Chest press", sets: 4, reps: "8-12" },
                { name: "Développé incliné (machine)", sets: 3, reps: "8-12" },
                { name: "Écarté couché (haltères)", sets: 3, reps: "10-12" },
                { name: "Pompes (si possible)", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 2 – Dos",
              exercises: [
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                { name: "Tirage horizontal (poulie)", sets: 3, reps: "8-12" },
                { name: "Rowing un bras haltère", sets: 3, reps: "10-12" },
                {
                  name: "Gainage lombaire (hyperextensions)",
                  sets: 3,
                  reps: "15-20",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes",
              exercises: [
                { name: "Leg press", sets: 4, reps: "10-15" },
                { name: "Fentes avec haltères", sets: 3, reps: "10 par jambe" },
                { name: "Leg curl", sets: 4, reps: "10-12" },
                { name: "Mollets assis (machine)", sets: 4, reps: "12-20" },
                { name: "Crunchs", sets: 3, reps: "20-25" },
              ],
            },
            {
              title: "Jour 4 – Épaules + abdos",
              exercises: [
                { name: "Développé épaules (haltères)", sets: 4, reps: "8-12" },
                { name: "Élévations latérales", sets: 3, reps: "10-12" },
                {
                  name: "Élévations postérieures (oiseaux)",
                  sets: 3,
                  reps: "10-12",
                },
                { name: "Crunchs", sets: 3, reps: "20-25" },
                {
                  name: "Planche",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 5 – Bras (biceps & triceps)",
              exercises: [
                { name: "Curl biceps haltères", sets: 4, reps: "10-12" },
                { name: "Curl marteau", sets: 3, reps: "10-12" },
                { name: "Triceps à la poulie", sets: 3, reps: "10-12" },
                { name: "Dips assistés", sets: 3, reps: "6-10" },
                { name: "Kickback triceps", sets: 3, reps: "12-15" },
              ],
            },
          ];
      }
    }

    if (isBodyweightBands) {
      switch (level) {
        case translations[language].activityLevels.beginner:
          return [
            {
              title: "Jour 1 – Haut du corps (Poitrine, épaules, triceps)",
              exercises: [
                {
                  name: "Pompes (poids du corps)",
                  sets: 3,
                  reps: "8-12",
                  note: "Si trop difficile, fais-les sur les genoux ou contre un mur",
                },
                {
                  name: "Pompes avec bande élastique (sur le dos)",
                  sets: 3,
                  reps: "10-12",
                },
                {
                  name: "Élévations latérales avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Extensions triceps avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Planche (gainage)",
                  sets: 3,
                  reps: "",
                  duration: "20-30 secondes",
                },
              ],
            },
            {
              title: "Jour 2 – Bas du corps (Jambes, fessiers, mollets)",
              exercises: [
                { name: "Squats au poids du corps", sets: 3, reps: "12-15" },
                {
                  name: "Fentes avant (poids du corps)",
                  sets: 3,
                  reps: "10-12 par jambe",
                },
                {
                  name: "Pont fessier avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout avec bande élastique",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Planche latérale (gainage)",
                  sets: 3,
                  reps: "",
                  duration: "15-20 secondes de chaque côté",
                },
              ],
            },
            {
              title: "Jour 3 – Full body (Totalité du corps)",
              exercises: [
                {
                  name: "Pompes inclinées avec bande élastique",
                  sets: 3,
                  reps: "8-12",
                },
                { name: "Squats avec bande élastique", sets: 3, reps: "12-15" },
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Fentes latérales avec bande élastique",
                  sets: 3,
                  reps: "12 par jambe",
                },
                {
                  name: "Planche (gainage dynamique)",
                  sets: 3,
                  reps: "",
                  duration: "20-30 secondes",
                },
              ],
            },
          ];
        case translations[language].activityLevels.intermediate:
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Pompes classiques avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Écarté couché avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Dips assistés avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Extensions triceps avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Kickback triceps avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Tirage horizontal avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Curl biceps avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Curl marteau avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Planche dynamique",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes + Abdos",
              exercises: [
                {
                  name: "Squats avec bande élastique autour des genoux",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Fentes avant avec bande élastique",
                  sets: 4,
                  reps: "10-12 par jambe",
                },
                {
                  name: "Pont fessier avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Crunchs avec bande élastique",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Relevé de jambes suspendu (si possible)",
                  sets: 3,
                  reps: "15-20",
                },
              ],
            },
            {
              title: "Jour 4 – Full body",
              exercises: [
                { name: "Pompes avec bande élastique", sets: 4, reps: "8-12" },
                {
                  name: "Squats sautés avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Fentes latérales avec bande élastique",
                  sets: 4,
                  reps: "12 par jambe",
                },
                {
                  name: "Planche dynamique avec mouvement de bras et jambes",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
          ];
        case translations[language].activityLevels.advanced:
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Pompes classiques avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Pompes inclinées avec bande élastique",
                  sets: 4,
                  reps: "10-12",
                },
                {
                  name: "Écarté couché avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Dips assistés avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Extensions triceps à la poulie avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Kickback triceps avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Tirage horizontal avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Curl biceps avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Curl marteau avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Planche dynamique avec mouvement de bras",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes + Abdos",
              exercises: [
                {
                  name: "Squats avec bande élastique autour des genoux",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Fentes avant avec bande élastique",
                  sets: 4,
                  reps: "10-12 par jambe",
                },
                {
                  name: "Pont fessier avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout avec bande élastique",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Crunchs avec bande élastique",
                  sets: 4,
                  reps: "15-20",
                },
                { name: "Relevé de jambes suspendu", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 4 – Épaules + Abdos",
              exercises: [
                {
                  name: "Développé épaules avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Élévations frontales avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Oiseaux (élévations postérieures) avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Planche dynamique (gainage)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 5 – Full body (Totalité du corps)",
              exercises: [
                {
                  name: "Pompes avec bande élastique autour du dos",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Squats sautés avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Fentes latérales avec bande élastique",
                  sets: 4,
                  reps: "12 par jambe",
                },
                {
                  name: "Gainage dynamique (planche avec rotations)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
          ];
      }
    }

    return [];
  };

  // Female training programs
  const generateFemaleProgram = (
    level: string,
    equipment: string[]
  ): TrainingDay[] => {
    const isWeightsMachines = equipment.includes("haltères et machines") || equipment.includes("weights and machines");
    const isBodyweightBands = equipment.includes(
      "poids du corps et bandes élastiques"
    ) || equipment.includes("bodyweight and resistance bands");

    if (isWeightsMachines) {
      switch (level) {
        case translations[language].activityLevels.beginner:
          return [
            {
              title: "Jour 1 – Haut du corps",
              exercises: [
                {
                  name: "Chest press (machine)",
                  sets: 4,
                  reps: "8-12",
                  note: "Repos : 60-90s entre chaque série",
                },
                { name: "Écarté couché haltères", sets: 3, reps: "12-15" },
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                {
                  name: "Développé épaules (haltères)",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Curl biceps (haltères)", sets: 3, reps: "10-12" },
                {
                  name: "Extension triceps à la poulie",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Bas du corps + Core",
              exercises: [
                { name: "Goblet squat (haltère)", sets: 4, reps: "8-12" },
                {
                  name: "Hip thrust (machine ou barre + banc)",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Leg curl (machine ischio)", sets: 4, reps: "10-12" },
                { name: "Mollets debout (machine)", sets: 3, reps: "15-20" },
                { name: "Crunchs au sol", sets: 3, reps: "20" },
                {
                  name: "Planche",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 3 – Full Body",
              exercises: [
                {
                  name: "Soulevé de terre jambes tendues (haltères)",
                  sets: 3,
                  reps: "8-12",
                },
                { name: "Développé couché haltères", sets: 3, reps: "8-12" },
                { name: "Rowing un bras (haltère)", sets: 3, reps: "10-12" },
                {
                  name: "Élévations latérales (haltères)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Gainage dynamique (planche + lever de bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes",
                },
              ],
            },
          ];
        case translations[language].activityLevels.intermediate:
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Chest press (machine)",
                  sets: 4,
                  reps: "8-12",
                  note: "Repos : 60-90s (composés) / 45-60s (isolations)",
                },
                { name: "Écarté incliné (haltères)", sets: 3, reps: "12-15" },
                {
                  name: "Dips assistés (machine ou banc)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Extension triceps à la poulie haute",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Kickback triceps (haltère)", sets: 3, reps: "12-15" },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                { name: "Tirage vertical (machine)", sets: 4, reps: "8-12" },
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                { name: "Rowing un bras (haltère)", sets: 3, reps: "10-12" },
                { name: "Curl biceps (haltères)", sets: 3, reps: "12-15" },
                { name: "Curl marteau (haltères)", sets: 3, reps: "12-15" },
              ],
            },
            {
              title: "Jour 3 – Jambes + Abdos",
              exercises: [
                { name: "Leg press (machine)", sets: 4, reps: "10-12" },
                {
                  name: "Hip thrust (machine ou barre + banc)",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Leg curl (machine ischio)", sets: 3, reps: "10-12" },
                { name: "Mollets debout (machine)", sets: 4, reps: "12-15" },
                { name: "Crunchs au sol (ou machine)", sets: 3, reps: "15-20" },
                {
                  name: "Planche (gainage)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 4 – Épaules + Full Body",
              exercises: [
                {
                  name: "Shoulder press (machine ou haltères)",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales (haltères)",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Goblet squat (haltère)", sets: 3, reps: "8-12" },
                {
                  name: "Rowing inversé (machine ou poulie basse)",
                  sets: 3,
                  reps: "10-12",
                },
                {
                  name: "Gainage dynamique (planche + lever bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes",
                },
              ],
            },
          ];
        case translations[language].activityLevels.advanced:
          return [
            {
              title: "Jour 1 – Poitrine",
              exercises: [
                { name: "Chest press (machine)", sets: 4, reps: "15-20" },
                {
                  name: "Développé incliné (haltères)",
                  sets: 3,
                  reps: "15-20",
                },
                { name: "Écarté couché (haltères)", sets: 3, reps: "15-20" },
                { name: "Pompes pieds surélevés", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 2 – Dos",
              exercises: [
                { name: "Tirage horizontal (poulie)", sets: 4, reps: "15-20" },
                { name: "Rowing assis (machine)", sets: 3, reps: "15-20" },
                {
                  name: "Tirage vertical prise neutre (machine)",
                  sets: 3,
                  reps: "15-20",
                },
                { name: "Rowing un bras (haltère)", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 3 – Jambes",
              exercises: [
                {
                  name: "Squat hack (machine) ou squat libre léger",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Hip thrust (machine ou barre + banc)",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Fentes marchées (haltères légers)",
                  sets: 3,
                  reps: "15-20 par jambe",
                },
                { name: "Leg curl (machine ischio)", sets: 3, reps: "15-20" },
                { name: "Mollets debout (machine)", sets: 4, reps: "20-25" },
              ],
            },
            {
              title: "Jour 4 – Épaules + Abdos",
              exercises: [
                {
                  name: "Développé épaules (haltères ou machine légère)",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Élévations latérales (haltères légers)",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Élévations postérieures (haltères ou machine)",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Crunchs à la machine ou au sol",
                  sets: 3,
                  reps: "20-25",
                },
                {
                  name: "Planche dynamique (alternance bras/jambe)",
                  sets: 3,
                  reps: "",
                  duration: "45-60 secondes",
                },
              ],
            },
            {
              title: "Jour 5 – Bras + Full Body Léger",
              exercises: [
                {
                  name: "Curl biceps (haltères légers)",
                  sets: 3,
                  reps: "15-20",
                },
                { name: "Curl incliné (haltères)", sets: 3, reps: "15-20" },
                {
                  name: "Extension triceps à la poulie",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Dips assistés (banc ou machine)",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Goblet squat léger (haltère)",
                  sets: 2,
                  reps: "20-25",
                  note: "Active recovery",
                },
              ],
            },
          ];
      }
    }

    if (isBodyweightBands) {
      switch (level) {
        case translations[language].activityLevels.beginner:
          return [
            {
              title: "Jour 1 – Haut du corps",
              exercises: [
                { name: "Pompes genoux (ou mur)", sets: 3, reps: "8-12" },
                {
                  name: "Rowing debout avec bande (tirage vers le bas)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales (bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Extensions triceps debout (bande sous un pied, bras tendu)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Planche (gainage statique)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 2 – Bas du corps + Core",
              exercises: [
                {
                  name: "Squat poids du corps (bandes autour des cuisses)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Fentes avant (alternées, bande sous le pied arrière)",
                  sets: 3,
                  reps: "8-12 par jambe",
                },
                {
                  name: "Pont fessier au sol (bandes autour des genoux)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout unipodaux (bande sous le pied de support)",
                  sets: 3,
                  reps: "12-15 par jambe",
                },
                {
                  name: "Planche latérale",
                  sets: 3,
                  reps: "",
                  duration: "20-30 secondes par côté",
                },
              ],
            },
            {
              title: "Jour 3 – Full Body",
              exercises: [
                {
                  name: "Pompes inclinées (mains sur banc/chair + bande autour du dos)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Soulevé de terre jambes tendues poids du corps",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Rowing un bras (bande fixée bas)",
                  sets: 3,
                  reps: "8-12 par bras",
                },
                {
                  name: "Fentes latérales (bande autour des genoux)",
                  sets: 3,
                  reps: "12-15 par jambe",
                },
                {
                  name: "Gainage dynamique (planche + lever bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes",
                },
              ],
            },
          ];
        case translations[language].activityLevels.intermediate:
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Pompes classiques ou sur les genoux",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Dips assistés (banc / chaise + bande sous les genoux)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Écarté debout avec bande (axe horizontal)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Extension triceps à la bande (bande sous un pied)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Kickback triceps (bande sous un pied, buste penché)",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                {
                  name: "Rowing debout avec bande (tirage bas → poitrine)",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Tirage horizontal avec bande (bande fixée bas)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Band pull-apart (écarté dos)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Curl biceps avec bande (pieds sur la bande)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Curl marteau (prise neutre, bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes + Core",
              exercises: [
                {
                  name: "Squat poids du corps + bande autour des cuisses",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Bulgarian split squat (pied arrière surélevé + bande sous le pied avant)",
                  sets: 3,
                  reps: "8-12 par jambe",
                },
                {
                  name: "Hip thrust au sol ou banc (bande autour des genoux)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Good morning jambes tendues (bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout unipodaux (bande sous le pied de support)",
                  sets: 3,
                  reps: "12-15 par jambe",
                },
                {
                  name: "Planche latérale",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes par côté",
                },
              ],
            },
            {
              title: "Jour 4 – Épaules + Full Body",
              exercises: [
                {
                  name: "Pompes inclinées (mains surélevées + bande autour du dos)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Développé épaules debout (bande sous les pieds)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales (bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Rowing un bras (bande fixée basse)",
                  sets: 3,
                  reps: "8-12 par bras",
                },
                {
                  name: "Gainage dynamique (planche + lever bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes",
                },
              ],
            },
          ];
        case translations[language].activityLevels.advanced:
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Pompes classiques + bande autour du dos",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Dips assistés entre deux chaises + bande sous les genoux",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Écarté debout à la bande (axe horizontal)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Extension triceps à la bande (bande sous un pied)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Kickback triceps (buste penché + bande sous un pied)",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                {
                  name: "Rowing debout à la bande (tirage bas → poitrine)",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Tirage horizontal à la bande (bande fixée bas)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Band pull apart (écarté dos)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Curl biceps à la bande (pieds sur la bande)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Curl marteau à la bande (prise neutre)",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes + Core",
              exercises: [
                {
                  name: "Squat poids du corps + bande autour des cuisses",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Bulgarian split squat + bande sous le pied avant",
                  sets: 3,
                  reps: "8-12 par jambe",
                },
                {
                  name: "Hip thrust (dos sur banc ou sol) + bande autour des genoux",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Good morning jambes tendues + bande sous les pieds",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout unipodaux + bande sous le pied de support",
                  sets: 3,
                  reps: "12-15 par jambe",
                },
                {
                  name: "Planche latérale",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes par côté",
                },
              ],
            },
            {
              title: "Jour 4 – Épaules + Abdos",
              exercises: [
                {
                  name: "Développé épaules debout à la bande (bande sous les pieds)",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales à la bande (bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Oiseaux (élévations postérieures) à la bande",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Crunchs au sol ou à la bande (bande derrière la tête)",
                  sets: 3,
                  reps: "15",
                },
                {
                  name: "Gainage dynamique (planche + lever bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 5 – Full Body Avancé",
              exercises: [
                {
                  name: "Pompes archers assistées à la bande",
                  sets: 3,
                  reps: "6-8 par jambe",
                },
                {
                  name: "Pistol squat assisté à la bande (surélever l'autre jambe)",
                  sets: 3,
                  reps: "6-8 par jambe",
                },
                {
                  name: "Rowing un bras à la bande (bande fixée basse)",
                  sets: 3,
                  reps: "8-12 par bras",
                },
                {
                  name: "Dips profonds assistés (entre deux chaises) + bande",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Hip thrust unilatéral + bande",
                  sets: 3,
                  reps: "8-12 par jambe",
                },
                {
                  name: "Gainage planche statique",
                  sets: 3,
                  reps: "",
                  duration: "45-60 secondes",
                },
              ],
            },
          ];
      }
    }

    return [];
  };
  // Main program generator
  const generateProgram = (
    level: string,
    isMale: boolean,
    equipment: string[]
  ): TrainingDay[] | SpecializedDay[] => {
    // Check for specialized programs first
    const specializedTypes = [
      "Yoga",
      "Pilates",
      "Tai-chi",
      "Qi Gong",
      "Stretching",
      "Karate",
      "Boxe",
      "Taekwondo",
      "Judo",
      "Kung-Fu / Wushu",
      "Ju-jitsu",
    ];

    const specializedProgram = equipment.find((eq) =>
      specializedTypes.includes(eq)
    );
    if (specializedProgram) {
      setIsSpecialized(true);
      return generateSpecializedProgram(specializedProgram);
    }

    setIsSpecialized(false);

    // Generate regular training programs based on gender
    if (patient.sex == "male") {
      return generateMaleProgram(level, equipment);
    } else {
      return generateFemaleProgram(level, equipment);
    }
  };
  // Modify handleAssignTraining function
  const handleAssignTraining = async (
    program: TrainingDay[] | SpecializedDay[]
  ) => {
    try {
      if (hasTraining) {
        toast.error(
          language === "fr"
            ? "Un programme d'entraînement est déjà assigné. Veuillez d'abord le supprimer avant d'en assigner un nouveau."
            : "A training plan is already assigned. Please delete it first before assigning a new one.",
          {
            className:
              "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
            descriptionClassName: "text-red-800 dark:text-red-200",
            style: {
              color: "rgb(185 28 28)", // text-red-700
            },
          }
        );
        return;
      }

      const token = localStorage.getItem("token");

      // Format the training data to match the schema
      const trainingData = {
        name: `Training Plan - ${patient?.nom || "patient"}`,
        type: trainingType,
        level:
          trainingType === "Sports de bien-être" ? "débutant" : activityLevel,
        equipment: equipment,
        exercises: program.map((day) => ({
          day: day.title, // Using title as the day identifier
          title: day.title,
          workouts: day.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets || 0,
            reps: exercise.reps || "",
            duration: exercise.duration || "",
            note: exercise.note || "",
          })),
        })),
      };

      // Create training plan
      const addTrainingResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/patients/trainings`,
        trainingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const createdTraining = addTrainingResponse.data.trainingPlan;

      // Assign training to visit
      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }api/patients/visits/${visitId}/assign-training`,
        { trainingId: createdTraining._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(
        language === "fr"
          ? "Plan d'entraînement attribué avec succès !"
          : "Training plan assigned successfully!",
        {
          className:
            "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800",
          descriptionClassName: "text-green-800 dark:text-green-200",
          style: {
            color: "rgb(21 128 61)", // text-green-700
          },
        }
      );

      if (onTrainingAssigned) {
        onTrainingAssigned();
      }
    } catch (error) {
      // Replace the error handling block with:
      if (axios.isAxiosError(error)) {
        toast.error(
          `${
            language === "fr"
              ? "Échec de l'attribution du plan : "
              : "Failed to assign training plan: "
          } ${error.response?.data?.message || error.message}`,
          {
            className:
              "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
            descriptionClassName: "text-red-800 dark:text-red-200",
            style: {
              color: "rgb(185 28 28)", // text-red-700
            },
          }
        );
      } else {
        toast.error(
          language === "fr"
            ? "Échec de l'attribution du plan d'entraînement"
            : "Failed to assign training plan",
          {
            className:
              "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
            descriptionClassName: "text-red-800 dark:text-red-200",
            style: {
              color: "rgb(185 28 28)", // text-red-700
            },
          }
        );
      }
    }
  };
 

  const generatePDF = (
    program: TrainingDay[] | SpecializedDay[],
    isMale: boolean
  ) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // Enhanced colors
    const colors = {
      primary: [41, 128, 185], // Nice blue
      secondary: [46, 204, 113], // Green
      accent: [230, 126, 34], // Orange
      text: [44, 62, 80], // Dark blue-grey
      lightGray: [236, 240, 241], // Light gray
      white: [255, 255, 255],
      headerBg: [52, 152, 219], // Bright blue
    };

    // Enhanced Header with Logo/Design
    const drawHeader = () => {
      doc.setFillColor(...colors.headerBg);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Add subtle design element
      doc.setFillColor(...colors.accent);
      doc.circle(pageWidth - 20, 20, 15, "F");

      doc.setFontSize(24);
      doc.setTextColor(...colors.white);
      doc.setFont("helvetica", "bold");
      const title =
        language === "fr" ? "PROGRAMME D'ENTRAÎNEMENT" : "TRAINING PROGRAM";
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, 25);
    };

    // Enhanced Patient Info Section
    const drawPatientInfo = () => {
      const infoX = margin;
      let infoY = 50;

      // Info box background
      doc.setFillColor(...colors.lightGray);
      doc.roundedRect(
        margin - 5,
        45,
        pageWidth - 2 * margin + 10,
        50,
        3,
        3,
        "F"
      );

      // Title
      doc.setFontSize(14);
      doc.setTextColor(...colors.primary);
      doc.setFont("helvetica", "bold");
      doc.text(
        language === "fr" ? "INFORMATIONS PATIENT" : "PATIENT INFORMATION",
        infoX,
        infoY
      );

      // Patient details in two columns
      infoY += 10;
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);

      const patientInfo = {
        name: `${patient?.firstname} ${patient?.lastname}`,
        doctor: doctorName || "Dr. ________",  // Add this line
        age: patient?.age || "--",
        weight: patient?.latestVisit[0]?.weight
          ? `${patient.latestVisit[0].weight} kg`
          : "--",
        height: patient?.height ? `${patient.height} cm` : "--",
        level: activityLevel,
        type: trainingType,
        date: new Date().toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US"
        ),
      };

      const leftColumn = [
        [`${language === "fr" ? "Praticien:" : "Doctor:"} ${patientInfo.doctor}`], // Add this line
        [`${language === "fr" ? "Patient:" : "Patient:"} ${patientInfo.name}`],
        [
          `${language === "fr" ? "Âge:" : "Age:"} ${patientInfo.age} ${
            language === "fr" ? "ans" : "years"
          }`,
        ],
        [`${language === "fr" ? "Taille:" : "Height:"} ${patientInfo.height}`],
      ];

      const rightColumn = [
        [`${language === "fr" ? "Poids:" : "Weight:"} ${patientInfo.weight}`],
        [`${language === "fr" ? "Niveau:" : "Level:"} ${patientInfo.level}`],
        [`${language === "fr" ? "Type:" : "Type:"} ${patientInfo.type}`],
      ];

      leftColumn.forEach((line, index) => {
        doc.text(line, infoX, infoY + index * 8);
      });

      rightColumn.forEach((line, index) => {
        doc.text(line, pageWidth / 2 + margin, infoY + index * 8);
      });
    };

    // Draw program content
    const drawProgramContent = () => {
      let currentY = 110;

      if (isSpecialized) {
        // Table headers for specialized program
        const headers = [
          language === "fr" ? "Jour" : "Day",
          language === "fr" ? "Séance" : "Session",
          language === "fr" ? "Objectif" : "Objective",
          language === "fr" ? "Durée" : "Duration",
        ];

        // Calculate column widths
        const margins = margin * 2;
        const tableWidth = pageWidth - margins;
        const colWidths = [
          tableWidth * 0.15, // Jour
          tableWidth * 0.3, // Séance
          tableWidth * 0.35, // Objectif
          tableWidth * 0.2, // Durée
        ];

        // Draw table header
        doc.setFillColor(...colors.primary);
        doc.setTextColor(...colors.white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        let xOffset = margin;
        headers.forEach((header, i) => {
          doc.rect(xOffset, currentY, colWidths[i], 10, "F");
          doc.text(header, xOffset + 2, currentY + 7);
          xOffset += colWidths[i];
        });

        currentY += 10;

        // Draw table content
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        (program as SpecializedDay[]).forEach((day, index) => {
          if (currentY > pageHeight - 30) {
            doc.addPage();
            drawHeader();
            currentY = 50;

            // Redraw headers on new page
            xOffset = margin;
            doc.setFillColor(...colors.primary);
            doc.setTextColor(...colors.white);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            headers.forEach((header, i) => {
              doc.rect(xOffset, currentY, colWidths[i], 10, "F");
              doc.text(header, xOffset + 2, currentY + 7);
              xOffset += colWidths[i];
            });
            currentY += 10;
            doc.setTextColor(...colors.text);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
          }

          // Draw row background
          if (index % 2 === 0) {
            doc.setFillColor(...colors.lightGray);
            doc.rect(margin, currentY, tableWidth, 20, "F");
          }

          // Draw cell content
          let x = margin;

          // Day
          doc.text(day.day, x + 2, currentY + 7);
          x += colWidths[0];

          // Session (with word wrap)
          const sessionLines = doc.splitTextToSize(
            day.session,
            colWidths[1] - 4
          );
          doc.text(sessionLines, x + 2, currentY + 7);
          x += colWidths[1];

          // Objective (with word wrap)
          const objectiveLines = doc.splitTextToSize(
            day.objective,
            colWidths[2] - 4
          );
          doc.text(objectiveLines, x + 2, currentY + 7);
          x += colWidths[2];

          // Duration
          doc.text(day.duration || "", x + 2, currentY + 7);

          currentY += 20;
        });
      } else {
        // Table for regular training program
        (program as TrainingDay[]).forEach((day, dayIndex) => {
          if (currentY > pageHeight - 50) {
            doc.addPage();
            drawHeader();
            currentY = 50;
          }

          // Day header
          doc.setFillColor(...colors.primary);
          doc.rect(margin, currentY, pageWidth - margin * 2, 10, "F");
          doc.setTextColor(...colors.white);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(day.title, margin + 5, currentY + 7);
          currentY += 15;

          // Exercise table headers
          const headers = [
            language === "fr" ? "Exercice" : "Exercise",
            language === "fr" ? "Séries" : "Sets",
            language === "fr" ? "Répétitions" : "Reps",
            language === "fr" ? "Notes" : "Notes",
          ];

          const colWidths = [
            (pageWidth - margin * 2) * 0.4, // Exercise name
            (pageWidth - margin * 2) * 0.15, // Sets
            (pageWidth - margin * 2) * 0.15, // Reps
            (pageWidth - margin * 2) * 0.3, // Notes
          ];

          // Draw table headers
          let x = margin;
          doc.setFillColor(...colors.primary);
          headers.forEach((header, i) => {
            doc.rect(x, currentY, colWidths[i], 8, "F");
            doc.text(header, x + 2, currentY + 6);
            x += colWidths[i];
          });
          currentY += 8;

          // Draw exercises
          doc.setTextColor(...colors.text);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);

          day.exercises.forEach((exercise, index) => {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              drawHeader();
              currentY = 50;

              // Redraw headers on new page
              x = margin;
              doc.setFillColor(...colors.primary);
              doc.setTextColor(...colors.white);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(10);
              headers.forEach((header, i) => {
                doc.rect(x, currentY, colWidths[i], 8, "F");
                doc.text(header, x + 2, currentY + 6);
                x += colWidths[i];
              });
              currentY += 8;
              doc.setTextColor(...colors.text);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9);
            }

            // Draw row background
            if (index % 2 === 0) {
              doc.setFillColor(...colors.lightGray);
              doc.rect(margin, currentY, pageWidth - margin * 2, 8, "F");
            }

            // Draw cell content
            x = margin;

            // Exercise name
            doc.text(exercise.name, x + 2, currentY + 6);
            x += colWidths[0];

            // Sets
            if (exercise.sets != 0) {
              doc.text(exercise.sets.toString(), x + 2, currentY + 6);
              x += colWidths[1];
            }

            // Reps/Duration
            doc.text(
              exercise.reps || exercise.duration || "",
              x + 2,
              currentY + 6
            );
            x += colWidths[2];

            // Notes

            currentY += 8;
          });

          currentY += 15; // Add space between days
        });
      }
    };

    // Generate the PDF
    drawHeader();
    drawPatientInfo();
    drawProgramContent();

    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(...colors.text);
      doc.text(
        `${
          language === "fr" ? "Date:" : "Date:"
        } ${new Date().toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US"
        )}`,
        margin,
        pageHeight - margin
      );
      doc.text(
        `${language === "fr" ? "Page" : "Page"} ${i}/${pageCount}`,
        pageWidth - margin - 30,
        pageHeight - margin
      );
    }

    doc.save(`programme-entrainement-${patient?.firstname || "patient"}.pdf`);
  };

const generateBlackAndWhitePDF = async (program: TrainingDay[] | SpecializedDay[]) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let yPos = 20;
    const margin = 20;
    
    // Helper function to add new page
    const addNewPage = () => {
      pdf.addPage();
      yPos = 20;
      // Add title to new page
      pdf.setFontSize(16);
      pdf.text('Tableau d\'Entraînement Hebdomadaire', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      return yPos;
    };

    // Helper function to check if need new page
    const checkNewPage = (height: number) => {
      if (yPos + height > pageHeight - margin) {
        return addNewPage();
      }
      return yPos;
    };

    // Title
    pdf.setFontSize(16);
    pdf.text('Tableau d\'Entraînement Hebdomadaire', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Patient Info Box with background
    pdf.setFontSize(12);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 40);
    
    yPos += 10;
    pdf.text(`Praticien: ${doctorName || 'Dr. ________'}`, margin + 5, yPos);
    yPos += 8;
    pdf.text(`Patient: ${patient?.firstname} ${patient?.lastname}`, margin + 5, yPos);
    yPos += 8;
    pdf.text(`Age: ${patient?.age || '__'} ans    Poids: ${patient?.latestVisit?.[0]?.weight || '__'} kg    Taille: ${patient?.height || '__'} cm`, margin + 5, yPos);
    yPos += 8;
    pdf.text(`IMC: ${calcIMC() || '__'}    Date: ${new Date().toLocaleDateString('fr-FR')}`, margin + 5, yPos);
    yPos += 20;

    // Table Headers with black background
    const headers = ['Jour', 'Exercice', 'Séries', 'Répétitions/Durée'];
    const colWidths = [30, 80, 25, 45];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    
    const drawHeaders = () => {
      let xPos = margin;
      
      // Draw black background for headers
      pdf.setFillColor(0, 0, 0);
      headers.forEach((header, i) => {
        pdf.rect(xPos, yPos, colWidths[i], 10, 'F');
        xPos += colWidths[i];
      });

      // Draw white text for headers
      xPos = margin;
      pdf.setTextColor(255, 255, 255);
      headers.forEach((header, i) => {
        pdf.text(header, xPos + 2, yPos + 7);
        xPos += colWidths[i];
      });
      pdf.setTextColor(0, 0, 0);
      yPos += 10;
    };

    drawHeaders();

    // Table Content
    let currentDayIndex = -1;
    let dayStartY = yPos;

    program.forEach((day, dayIndex) => {
      // Start new day
      if (currentDayIndex !== dayIndex) {
        // If not first day, draw the previous day's border
        if (currentDayIndex !== -1) {
          pdf.rect(margin, dayStartY, colWidths[0], yPos - dayStartY);
        }
        currentDayIndex = dayIndex;
        dayStartY = yPos;
      }

      day.exercises.forEach((exercise, exIndex) => {
        yPos = checkNewPage(10);
        
        if (yPos === 35) { // New page was added
          drawHeaders();
          // Reset day tracking for new page
          dayStartY = yPos;
        }

        let xPos = margin;
        
        // Draw row background (alternate colors)
        pdf.setFillColor(dayIndex % 2 === 0 ? 245 : 255, dayIndex % 2 === 0 ? 245 : 255, dayIndex % 2 === 0 ? 245 : 255);
        pdf.rect(margin, yPos, tableWidth, 10, 'F');
        
        // Draw row borders (except for day column)
        xPos = margin + colWidths[0]; // Start after day column
        for (let i = 1; i < headers.length; i++) {
          pdf.rect(xPos, yPos, colWidths[i], 10);
          xPos += colWidths[i];
        }

        // Fill content
        // Only write day number once at the start of each day's exercises
        if (exIndex === 0) {
          pdf.text(`Jour ${dayIndex + 1}`, margin + 2, yPos + 7);
        }
        
        xPos = margin + colWidths[0];
        
        // Exercise name with word wrap
        const splitName = pdf.splitTextToSize(exercise.name, colWidths[1] - 4);
        pdf.text(splitName, xPos + 2, yPos + 7);
        xPos += colWidths[1];
        
        pdf.text(exercise.sets?.toString() || '-', xPos + 2, yPos + 7);
        xPos += colWidths[2];
        
        const repsText = exercise.reps || exercise.duration || '-';
        pdf.text(repsText, xPos + 2, yPos + 7);
        
        yPos += 10;
      });
    });

    // Draw the final day's border
    if (currentDayIndex !== -1) {
      pdf.rect(margin, dayStartY, colWidths[0], yPos - dayStartY);
    }

    // Check if there's enough space for guidelines
    const guidelinesHeight = 100; // Approximate height needed for guidelines
    const remainingSpace = pageHeight - yPos - margin;
    
    if (remainingSpace < guidelinesHeight) {
      yPos = addNewPage();
    } else {
      yPos += 10; // Add some spacing
    }

    // Guidelines section with box
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 80, 'F');
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 80);
    
    // Guidelines title with background
    pdf.setFillColor(0, 0, 0);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text('Conseils pour Utiliser le Tableau', margin + 5, yPos + 7);
    pdf.setTextColor(0, 0, 0);
    
    yPos += 15;
    
    pdf.setFontSize(10);
    const guidelines = [
      'Boire un verre d\'eau 20 à 30 minutes avant l\'effort.',
      'Faire 5 à 10 minutes d\'échauffement progressif.',
      'Porter une tenue confortable et des chaussures adaptées.',
      'Éviter les repas lourds juste avant l\'exercice.',
      'Vérifier que l\'espace et le matériel sont sécurisés.',
      'Écouter son corps : arrêter en cas de douleur ou de malaise.',
      'Adapter l\'intensité selon sa condition physique.'
    ];

    guidelines.forEach(line => {
      pdf.text(`• ${line}`, margin + 5, yPos);
      yPos += 8;
    });

    // Add page number to each page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Page ${i} sur ${pageCount}`, pageWidth - margin - 25, pageHeight - margin);
    }

    pdf.save(`programme-entrainement-${patient?.firstname || 'patient'}-bw.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Une erreur est survenue lors de la génération du PDF');
  }
};

 const getFilteredEquipmentOptions = () => {
  if (!trainingType) return [];
  
  const currentLang = language as "fr" | "en";
  const currentTrainingType = translations[currentLang].trainingTypes[
    trainingType === translations[currentLang].trainingTypes.musculation 
      ? "musculation" 
      : "wellness"
  ];
  
  return trainingTypeEquipment[currentTrainingType] || [];
};

  // Handle equipment selection
  const handleEquipmentChange = (equipmentItem: string) => {
    setEquipment([equipmentItem]); // Replace the array with a single item
  };
const [doctorName, setDoctorName] = useState("");
useEffect(() => {
  const fetchDoctorInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Doctor info response:", response.data);
      const fullName = `Dr. ${response.data.firstname} ${response.data.lastname}`;
      setDoctorName(fullName);
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    }
  };

  fetchDoctorInfo();
}, []);
  // Clear equipment when training type changes
  useEffect(() => {
    setEquipment([]);
  }, [trainingType]);

  useEffect(() => {
    if (trainingType && equipment.length > 0) {
      // For "Sports de bien-être", we don't need to check activityLevel
      const shouldGenerateProgram =
        trainingType === "Sports de bien-être" ||
        (trainingType !== "Sports de bien-être" && activityLevel);

      if (shouldGenerateProgram) {
        const isMale = patient.sex === "male";
        const program = generateProgram(activityLevel, isMale, equipment);

        setGeneratedProgram(program);
      }
    } else {
      setGeneratedProgram([]);
    }
  }, [trainingType, equipment, activityLevel, patient.sex]);
const calcIMC = () => {
  const weight = patient?.latestVisit?.[0]?.weight;
  const height = patient?.height;

  if (!weight || !height) return null;

  // Convert height from cm to meters
  const heightInMeters = height / 100;
  const imc = weight / (heightInMeters * heightInMeters);
  
  return imc.toFixed(1);
};
  const handleTrainingSubmit = () => {
    const isValid = trainingType && 
      equipment.length > 0 && 
      (trainingType === "Sports de bien-être" || 
       (trainingType !== "Sports de bien-être" && activityLevel));

    if (!isValid) {
      toast.error(language === "fr" 
        ? "Veuillez remplir tous les champs requis."
        : "Please fill in all required fields.");
      return;
    }

    // Assign the training plan
    handleAssignTraining(generatedProgram);
    
    // Store the program and show the modal
    setSelectedProgram(generatedProgram);
    setShowPdfModal(true);
  };

  // Add this component for the PDF selection modal
  const PdfSelectionModal = () => {
    if (!showPdfModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">
            {language === "fr" 
              ? "Choisissez le style de PDF" 
              : "Choose PDF style"}
          </h3>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <button
              onClick={() => {
                generatePDF(selectedProgram, patient.sex === "male");
                setShowPdfModal(false);
              }}
              className="p-4 border-2 border-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              <h4 className="font-semibold text-primary mb-2">
                {language === "fr" ? "Style Coloré" : "Colored Style"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === "fr" 
                  ? "Version moderne avec mise en page colorée" 
                  : "Modern version with colored layout"}
              </p>
            </button>

            <button
              onClick={() => {
                generateBlackAndWhitePDF(selectedProgram, {
                  doctorName: doctorName,
                  patientName: `${patient?.firstname} ${patient?.lastname}`,
                  age: patient?.age,
                  weight: patient?.latestVisit?.[0]?.weight,
                  height: patient?.height,
                  imc: calcIMC(),
                  date: new Date().toLocaleDateString('fr-FR')
                });
                setShowPdfModal(false);
              }}
              className="p-4 border-2 border-border rounded-lg hover:bg-accent transition-colors"
            >
              <h4 className="font-semibold mb-2">
                {language === "fr" ? "Style Noir et Blanc" : "Black and White Style"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === "fr" 
                  ? "Version simple et imprimable" 
                  : "Simple, printer-friendly version"}
              </p>
            </button>
          </div>

          <button
            onClick={() => setShowPdfModal(false)}
            className="w-full p-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
          >
            {language === "fr" ? "Annuler" : "Cancel"}
          </button>
        </div>
      </div>
    );
  };

  // Add this function to fetch the assigned training data
  const fetchAssignedTraining = async () => {
    if (!hasTraining) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/patients/visits/${visitId}/training`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setAssignedTraining(response.data.trainingPlan);
    } catch (error) {
      console.error('Error fetching training plan:', error);
      toast.error('Erreur lors de la récupération du plan d\'entraînement');
    }
  };

  // Add useEffect to fetch data when component mounts
  useEffect(() => {
    if (hasTraining) {
      fetchAssignedTraining();
    }
  }, [hasTraining, visitId]);

  return (
    <div className="bg-card space-y-6 rounded-xl shadow-lg p-8 mb-8 border border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
        {translations[language].title} - {patient.sex === "male" ? translations[language].male : translations[language].female}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {hasTraining ? (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
              {translations[language].alreadyAssigned}
            </div>
          ) : (
            <>
              {/* Training Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {translations[language].trainingType}
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none bg-background hover:bg-background/80 text-foreground"
                  value={trainingType}
                  onChange={(e) => setTrainingType(e.target.value)}
                  required
                >
                  <option value="" className="text-muted-foreground">
                    {translations[language].selectType}
                  </option>
                  {trainingTypes.map((type) => (
                    <option key={type} value={type} className="text-foreground">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment Selection */}
              {trainingType && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {translations[language].equipment}
                  </label>
                  <div className="border-2 border-border rounded-lg p-4 bg-background/50 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {getFilteredEquipmentOptions().map((eq) => (
                        <label
                          key={eq}
                          className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors duration-150"
                        >
                          <input
                            type="radio" // Changed from checkbox to radio
                            name="equipment" // Added name attribute for radio group
                            checked={equipment.includes(eq)}
                            onChange={() => handleEquipmentChange(eq)}
                            className="w-4 h-4 text-primary border-2 border-border rounded-full focus:ring-2 focus:ring-primary/20" // Updated classes for radio style
                          />
                          <span className="text-sm text-foreground select-none">
                            {eq}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Sélectionnez le matériel disponible pour {trainingType}
                  </p>
                </div>
              )}

              {/* Activity Level */}
              {trainingType && (trainingType !== "Sports de bien-être" && trainingType !== "Wellness Sports") && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {translations[language].activityLevel}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {activityLevels.map((level) => (
                      <label
                        key={level}
                        className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          activityLevel === level
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background/50 hover:border-border/80 hover:bg-background"
                        }`}
                      >
                        <input
                          type="radio"
                          name="activityLevel"
                          value={level}
                          checked={activityLevel === level}
                          onChange={(e) => setActivityLevel(e.target.value)}
                          className="sr-only"
                          required
                        />
                        <span className="text-sm font-medium capitalize">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <div className="space-y-4">
  {/* Submit Button - Only show if no training is assigned */}
  {!hasTraining && (
    <button
      type="button"
      onClick={() => handleAssignTraining(generatedProgram)}
      disabled={generatedProgram.length === 0}
      className={`w-full ${
        generatedProgram.length === 0
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
      } text-primary-foreground font-semibold py-3 px-6 rounded-lg focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
    >
      {generatedProgram.length === 0
        ? translations[language].fillFields
        : translations[language].assignButton}
    </button>
  )}

  {/* Download Buttons - Always show if program exists */}
  {(generatedProgram.length > 0 || hasTraining) && (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => generatePDF(
          hasTraining && assignedTraining 
            ? assignedTraining.exercises.map(day => ({
                title: day.title,
                exercises: day.workouts.map(workout => ({
                  name: workout.name,
                  sets: workout.sets,
                  reps: workout.reps,
                  duration: workout.duration,
                  note: workout.note
                }))
              }))
            : generatedProgram, 
          patient.sex === "male"
        )}
        className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary/10 text-primary border-2 border-primary rounded-lg hover:bg-primary/20 transition-colors"
      >
        <span className="text-sm font-medium">
          {language === "fr" ? "Version colorée" : "Colored version"}
        </span>
      </button>

      <button
        onClick={() => generateBlackAndWhitePDF(
          hasTraining && assignedTraining 
            ? assignedTraining.exercises.map(day => ({
                title: day.title,
                exercises: day.workouts.map(workout => ({
                  name: workout.name,
                  sets: workout.sets,
                  reps: workout.reps,
                  duration: workout.duration,
                  note: workout.note
                }))
              }))
            : generatedProgram
        )}
        className="flex items-center justify-center space-x-2 px-4 py-2 bg-background text-foreground border-2 border-border rounded-lg hover:bg-accent transition-colors"
      >
        <span className="text-sm font-medium">
          {language === "fr" ? "Version N&B" : "B&W version"}
        </span>
      </button>
    </div>
  )}

  {/* Message when training is assigned */}
  {hasTraining && (
    <p className="text-sm text-muted-foreground text-center">
      {language === "fr" 
        ? "Programme d'entraînement assigné. Téléchargez votre programme dans le format souhaité."
        : "Training program assigned. Download your program in your preferred format."}
    </p>
  )}
</div>
        </div>

        {/* Right Column - Program Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {translations[language].previewTitle}
          </h3>

          {generatedProgram.length > 0 ? (
            <div className="bg-background/50 rounded-lg p-4 max-h-96 overflow-y-auto border border-border/50">
              {isSpecialized
                ? // Specialized program display
                  (generatedProgram as SpecializedDay[]).map((day, index) => (
                    <div
                      key={index}
                      className="mb-4 p-3 bg-card rounded-lg shadow-sm border border-border/50"
                    >
                      <h4 className="font-semibold text-primary">
                        {day.title}
                      </h4>
                      {day.exercises.map((exercise, exIndex) => (
                        <div key={exIndex}>
                          <p className="text-sm font-medium text-foreground">
                            {exercise.name}
                          </p>
                          {exercise.duration && (
                            <p className="text-xs text-primary font-medium">
                              Durée: {exercise.duration}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                : // Regular program display
                  (generatedProgram as TrainingDay[]).map((day, index) => (
                    <div
                      key={index}
                      className="mb-4 p-3 bg-card rounded-lg shadow-sm border border-border/50"
                    >
                      <h4 className="font-semibold text-primary mb-2">
                        {day.title}
                      </h4>
                      <ul className="space-y-1">
                        {day.exercises.slice(0, 3).map((exercise, exIndex) => (
                          <li
                            key={exIndex}
                            className="text-xs text-muted-foreground"
                          >
                            • {exercise.name} - {exercise.sets}x
                            {exercise.reps || exercise.duration}
                          </li>
                        ))}
                        {day.exercises.length > 3 && (
                          <li className="text-xs text-muted-foreground italic">
                            ... et {day.exercises.length - 3} exercices de plus
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
            </div>
          ) : (
            <div className="bg-background/50 rounded-lg p-8 text-center border border-border/50">
              <p className="text-muted-foreground">
    {translations[language].selectParamsForPreview}
  </p>
            </div>
          )}
        </div>
      </div>

      <PdfSelectionModal />
    </div>
  );
}