import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: "apercu" | "historique" | "editeur" | "entrainement";
  onTabChange: (
    tab: "apercu" | "historique" | "editeur" | "entrainement"
  ) => void;
  language: "fr" | "en";
}

export function TabNavigation({
  activeTab,
  onTabChange,
  language,
}: TabNavigationProps) {
  const texts = {
    fr: {
      apercu: "Aperçu",
      historique: "Historique",
      editeur: "Éditeur de Régime",
      entrainement: "Entraînement",
    },
    en: {
      apercu: "Overview",
      historique: "History",
      editeur: "Diet Editor",
      entrainement: "Training",
    },
  };

  const t = texts[language];

  const tabs = [
    { id: "apercu" as const, label: t.apercu },
    { id: "historique" as const, label: t.historique },
    { id: "editeur" as const, label: t.editeur },
    { id: "entrainement" as const, label: t.entrainement },
  ];

  return (
    <div className="flex space-x-1 bg-muted p-1 rounded-lg">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          className={`flex-1 font-medium transition-all ${
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
