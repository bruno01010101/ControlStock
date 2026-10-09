import { useId } from "react";
import styles from "./SelectField.module.css";
import { ChevronIcon } from "./icons";

/**
 * Select genérico: label em cima, ícone dentro do campo.
 *
 * Props:
 * - label: texto acima do campo
 * - icon: elemento React (ex.: <BuildingIcon />) exibido dentro do campo
 * - value: valor selecionado
 * - onChange: (value) => void  -> já recebe o valor, não o evento
 * - options: [{ value, label }]
 * - placeholder: texto opcional quando nada está selecionado
 * - disabled: desabilita o campo
 */
export function SelectField({
  label,
  icon,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
}) {
  const id = useId();

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <div className={styles.control}>
        {icon && <span className={styles.icon}>{icon}</span>}

        <select
          id={id}
          className={`${styles.select} ${icon ? styles.withIcon : ""}`}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className={styles.chevron}>
          <ChevronIcon />
        </span>
      </div>
    </div>
  );
}

export default SelectField;
