import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface Patient {
  sex: string;
  nom?: string;
  prenom?: string;
}

interface TrainingTabProps {
  patient: Patient;
  visitId: string; // Add this prop
  onTrainingAssigned?: () => void; // Add this callback
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
}

export default function TrainingTab({
  patient,
  visitId,
  onTrainingAssigned,
}: TrainingTabProps) {
  const [trainingType, setTrainingType] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState("");

  const [generatedProgram, setGeneratedProgram] = useState<
    TrainingDay[] | SpecializedDay[]
  >([]);
  const [language, setLanguage] = useState("fr"); // Default to French

  const [isSpecialized, setIsSpecialized] = useState(false);

  const trainingTypeEquipment: Record<string, string[]> = {
    "Musculation (Gym)": ["haltères et machines"],
    "Musculation (Non Gym)": ["poids du corps et bandes élastiques"],
    "Sports de bien-être": [
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
    ],
  };

  const trainingTypes = [
    "Musculation (Gym)",
    "Musculation (Non Gym)",
    "Sports de bien-être",
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
  const activityLevels = ["débutant", "intermédiaire", "avancé"];

  // Specialized programs (same for both genders)
  const generateSpecializedProgram = (type: string): SpecializedDay[] => {
    switch (type) {
      case "Yoga":
        return [
          {
            title: "Lundi – Hatha Yoga Doux",
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
            exercises: [
              {
                name: "Récupération active",
                sets: 0,
                reps: "",
                duration: "30-45 min",
              },
            ],
          },
        ];
      case "Pilates":
        return [
          {
            title: "Lundi – Pilates de base – Centre & respiration",
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
            exercises: [
              {
                name: "Récupération et détente",
                sets: 0,
                reps: "",
                duration: "30-45 min",
              },
            ],
          },
        ];
      case "Karate":
        return [
          {
            title: "Lundi – Kihon (techniques de base)",
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
            exercises: [
              {
                name: "Esprit du karaté, recentrage",
                sets: 0,
                reps: "",
                duration: "30-45 min",
              },
            ],
          },
        ];
      case "Tai-chi":
        return [
          {
            title: "Lundi – Postures de base + respiration consciente",
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
            exercises: [
              {
                name: "Récupération naturelle",
                sets: 0,
                reps: "",
                duration: "20-30 min",
              },
            ],
          },
        ];
      case "Qi Gong":
        return [
          {
            title: "Lundi – Échauffement énergétique + 8 pièces de Brocart",
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
            exercises: [
              {
                name: "Récupération énergétique, conscience du souffle",
                sets: 0,
                reps: "",
                duration: "20-30 min",
              },
            ],
          },
        ];
      case "Stretching":
        return [
          {
            title: "Lundi – Stretching global du corps (full body)",
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
            exercises: [
              {
                name: "Auto-écoute et libération corporelle",
                sets: 0,
                reps: "",
                duration: "20-30 min",
              },
            ],
          },
        ];
      case "Boxe":
        return [
          {
            title: "Lundi – Cardio + shadow boxing",
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
            exercises: [
              {
                name: "Agilité et défense",
                sets: 0,
                reps: "",
                duration: "45-60 min",
              },
            ],
          },
        ];
      case "Taekwondo":
        return [
          {
            title: "Lundi – Techniques de jambes (Chagi)",
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
            exercises: [
              {
                name: "Application combat et puissance",
                sets: 0,
                reps: "",
                duration: "45-60 min",
              },
            ],
          },
        ];
      case "Judo":
        return [
          {
            title: "Lundi – Ukemi (chutes) + déplacements",
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
            exercises: [
              {
                name: "Application pratique des techniques",
                sets: 0,
                reps: "",
                duration: "45-60 min",
              },
            ],
          },
        ];
      case "Kung-Fu / Wushu":
        return [
          {
            title: "Lundi – Postures + techniques de base",
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
            exercises: [
              {
                name: "Techniques avancées selon niveau",
                sets: 0,
                reps: "",
                duration: "45-60 min",
              },
            ],
          },
        ];
      case "Ju-jitsu":
        return [
          {
            title: "Lundi – Mouvements au sol (escapes, gardes)",
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
            exercises: [
              {
                name: "Maintien et régénération",
                sets: 0,
                reps: "",
                duration: "45-60 min",
              },
            ],
          },
        ];
      default:
        return [];
    }
  };

  // Male training programs
  const generateMaleProgram = (
    level: string,
    equipment: string[]
  ): TrainingDay[] => {
    const isWeightsMachines = equipment.includes("haltères et machines");
    const isBodyweightBands = equipment.includes(
      "poids du corps et bandes élastiques"
    );

    if (isWeightsMachines) {
      switch (level) {
        case "débutant":
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
        case "intermédiaire":
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
        case "avancé":
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
        case "débutant":
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
        case "intermédiaire":
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
        case "avancé":
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
    const isWeightsMachines = equipment.includes("haltères et machines");
    const isBodyweightBands = equipment.includes(
      "poids du corps et bandes élastiques"
    );

    if (isWeightsMachines) {
      switch (level) {
        case "débutant":
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
        case "intermédiaire":
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
        case "avancé":
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
        case "débutant":
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
        case "intermédiaire":
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
        case "avancé":
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
  const handleAssignTraining = async (
    program: TrainingDay[] | SpecializedDay[]
  ) => {
    try {
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
        "http://localhost:8000/api/patients/trainings",
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
        `http://localhost:8000/api/patients/visits/${visitId}/assign-training`,
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
  const handleTrainingSubmit = () => {
    if (
      !trainingType ||
      equipment.length === 0 ||
      (trainingType !== "Sports de bien-être" && !activityLevel)
    ) {
      toast.error(
        language === "fr"
          ? "Veuillez remplir tous les champs requis."
          : "Please fill in all required fields.",
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

    const isMale = patient.sex === "male";
    const program = generateProgram(activityLevel, isMale, equipment);
    setGeneratedProgram(program);

    // Assign the training plan
    handleAssignTraining(program);

    // Generate PDF
    generatePDF(program, isMale);
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
        [`${language === "fr" ? "Nom:" : "Name:"} ${patientInfo.name}`],
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

  const getFilteredEquipmentOptions = () => {
    if (!trainingType) return [];
    return trainingTypeEquipment[trainingType] || [];
  };

  // Handle equipment selection
  const handleEquipmentChange = (equipmentItem: string) => {
    setEquipment((prev) =>
      prev.includes(equipmentItem)
        ? prev.filter((item) => item !== equipmentItem)
        : [...prev, equipmentItem]
    );
  };

  // Clear equipment when training type changes
  useEffect(() => {
    setEquipment([]);
  }, [trainingType]);
  return (
    <div className="bg-card space-y-6 rounded-xl shadow-lg p-8 mb-8  border border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
        Assigner un entraînement - {patient.sex === "male" ? "Homme" : "Femme"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Training Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Type d'entraînement
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none bg-background hover:bg-background/80 text-foreground"
              value={trainingType}
              onChange={(e) => setTrainingType(e.target.value)}
              required
            >
              <option value="" className="text-muted-foreground">
                Sélectionner un type
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
                Matériel disponible
              </label>
              <div className="border-2 border-border rounded-lg p-4 bg-background/50 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {getFilteredEquipmentOptions().map((eq) => (
                    <label
                      key={eq}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors duration-150"
                    >
                      <input
                        type="checkbox"
                        checked={equipment.includes(eq)}
                        onChange={() => handleEquipmentChange(eq)}
                        className="w-4 h-4 text-primary border-2 border-border rounded focus:ring-2 focus:ring-primary/20"
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
          {trainingType && trainingType !== "Sports de bien-être" && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Niveau d'activité
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

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleTrainingSubmit}
            className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:from-primary/90 hover:to-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Générer le programme d'entraînement
          </button>
        </div>

        {/* Right Column - Program Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Aperçu du programme
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
                      <h4 className="font-semibold text-primary">{day.day}</h4>
                      <p className="text-sm font-medium text-foreground">
                        {day.session}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {day.objective}
                      </p>
                      {day.duration && (
                        <p className="text-xs text-primary font-medium">
                          {day.duration}
                        </p>
                      )}
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
                Sélectionnez les paramètres et cliquez sur "Générer" pour voir
                le programme
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
