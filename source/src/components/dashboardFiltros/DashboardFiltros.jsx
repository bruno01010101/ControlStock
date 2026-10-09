import styles from "./DashboardFiltros.module.css";
import { SelectField } from "./SelectField";
import { PeriodoAnalise } from "./PeriodoAnalise";
import { BuildingIcon, StoreIcon } from "./icons";

/**
 * Barra de filtros do dashboard: organização, unidades e período.
 *
 * Props (todas controladas pela página):
 * - organizacoes: [{ value, label }]   organizacao / onOrganizacaoChange(value)
 * - unidades:     [{ value, label }]   unidade / onUnidadeChange(value)
 * - periodo / onPeriodoChange(value)
 */
export function DashboardFiltros({
  organizacoes = [],
  organizacao,
  onOrganizacaoChange,
  unidades = [],
  unidade,
  onUnidadeChange,
  periodo,
  onPeriodoChange,
}) {
  return (
    <div className={styles.filtros}>
      <SelectField
        label="Organização"
        icon={<BuildingIcon />}
        value={organizacao}
        onChange={onOrganizacaoChange}
        options={organizacoes}
        placeholder="Selecione a organização"
      />

      <SelectField
        label="Unidades"
        icon={<StoreIcon />}
        value={unidade}
        onChange={onUnidadeChange}
        options={unidades}
        placeholder="Selecione a unidade"
      />

      <PeriodoAnalise value={periodo} onChange={onPeriodoChange} />
    </div>
  );
}

export default DashboardFiltros;
