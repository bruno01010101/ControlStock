import { SelectField } from "./SelectField";
import { CalendarIcon } from "./icons";

export const PERIODOS_PADRAO = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "mes_atual", label: "Este mês" },
  { value: "mes_anterior", label: "Mês anterior" },
  { value: "ano_atual", label: "Este ano" },
];

/**
 * Seletor de período, reutilizável em Dashboard, Entradas e Saídas.
 *
 * Props:
 * - value: período selecionado (ex.: "30d")
 * - onChange: (value) => void
 * - options: opcional, para trocar a lista de períodos em uma página específica
 * - label: opcional, padrão "Período de análise"
 */
export function PeriodoAnalise({
  value,
  onChange,
  options = PERIODOS_PADRAO,
  label = "Período de análise",
}) {
  return (
    <SelectField
      label={label}
      icon={<CalendarIcon />}
      value={value}
      onChange={onChange}
      options={options}
    />
  );
}

export default PeriodoAnalise;
