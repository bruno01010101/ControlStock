import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function Selecao({ value, onChange }) {
  return (
    <FormControl fullWidth size="small" sx={{ fontSize: '0.5rem' }}>
      <InputLabel id="filtro-situacao-label">Filtrar</InputLabel>
      <Select
        labelId="filtro-situacao-label"
        id="filtro-situacao"
        value={value}
        label="Filtrar"
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="ruim">Estoque baixo</MenuItem>
        <MenuItem value="mid">Estoque médio</MenuItem>
        <MenuItem value="bom">Estoque alto</MenuItem>
      </Select>
    </FormControl>
  );
}