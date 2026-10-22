
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import styles from "./GastosPorCategoria.module.css";


export default function GastosPorCategoria({ categorias }) {
  const categoriaPrincipal = categorias.reduce(
    (maior, atual) =>
      atual.porcentagem > maior.porcentagem ? atual : maior,
    categorias[0]
  );

  return (
    <Box className={styles.card}>
      <Box className={styles.header}>
        <Typography className={styles.titulo}>
          Gastos por unidade
        </Typography>

        <Typography className={styles.subtitulo}>
          Distribuição do total no período
        </Typography>
      </Box>

      <Box className={styles.lista}>
        {categorias.map((categoria) => (
          <Box key={categoria.nome} className={styles.categoria}>
            <Box className={styles.info}>
              <Typography className={styles.nome}>
                {categoria.nome}
              </Typography>

              <Typography className={styles.valor}>
                R$ {categoria.valor.toLocaleString("pt-BR")} ·{" "}
                {categoria.porcentagem}%
              </Typography>
            </Box>

            <Box className={styles.trilho}>
              <Box
                className={styles.barra}
                sx={{
                  width: `${categoria.porcentagem}%`,
                  backgroundColor:
                    categoria.nome === categoriaPrincipal?.nome
                      ? "#2563eb"
                      : "#a8c4ff",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      <Box className={styles.rodape}>
        <Typography className={styles.textoRodape}>
          {categoriaPrincipal
            ? `${categoriaPrincipal.nome} representa ${categoriaPrincipal.porcentagem}% dos gastos.`
            : "Nenhum gasto registrado no período."}
        </Typography>
      </Box>
    </Box>
  );
}
