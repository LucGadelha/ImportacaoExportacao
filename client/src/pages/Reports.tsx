import { useState } from "react";
import ReportFilters, { ReportFilters as Filters } from "@/components/reports/ReportFilters";
import ReportOutput from "@/components/reports/ReportOutput";

export default function Reports() {
  const [activeFilters, setActiveFilters] = useState<Filters | null>(null);

  const handleGenerateReport = (filters: Filters) => {
    setActiveFilters(filters);
  };

  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
      </div>

      <ReportFilters onGenerateReport={handleGenerateReport} />
      
      {activeFilters && <ReportOutput filters={activeFilters} />}
    </section>
  );
}
