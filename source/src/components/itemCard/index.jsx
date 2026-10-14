import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";

const CORES = [
  "#B87A45", // marrom
  "#434D6B", // azul-marinho
  "#E8DFD1", // bege
  "#D8E6F1", // azul claro
  "#D5B484", // areia
  "#C6A67B", // areia escura
  "#D8DCE6", // cinza azulado
];

// mesmo id sempre cai na mesma cor, sem salvar nada no banco
function corDoItem(id) {
  const texto = String(id);
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return CORES[hash % CORES.length];
}

export default function ItemCard({ item: { id, nome } }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: "10px",
          bgcolor: corDoItem(id),
          color: "#fff",
        }}
      >
        <Inventory2Outlined sx={{ fontSize: 20 }} />
      </Box>

      <Typography
        noWrap
        sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#1E2433", minWidth: 0 }}
      >
        {nome}
      </Typography>
    </Box>
  );
}