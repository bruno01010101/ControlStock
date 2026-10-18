import { useId } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export default function Selecao({
  value,
  onChange,
  opcoes = [],
  label = "Filtrar",
  todos = "Todos",
}) {
  // id único, para poder usar mais de um Selecao na mesma tela
  const id = useId();
  const labelId = `${id}-label`;
  return (
    <FormControl fullWidth size="small" sx={{ fontSize: "0.5rem" }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        value={value}
        label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">{todos}</MenuItem>
        {opcoes.map((opcao) => (
          <MenuItem key={opcao.value} value={opcao.value}>
            {opcao.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
