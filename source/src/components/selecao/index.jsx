import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';

export default function Selecao() {
    const [unidade, setUnidade] = useState('');
    const handleChange = (event) => {
        setUnidade(event.target.value);
    }

    return (
        <FormControl fullWidth size="small" sx={{ fontSize: '0.5rem' }}>
            <InputLabel id="demo-simple-select-label">Filtrar</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={unidade}
                label="Unidade"
                onChange={handleChange}
            >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
            </Select>
        </FormControl>
    )
}