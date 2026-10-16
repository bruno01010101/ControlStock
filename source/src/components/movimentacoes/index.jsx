import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import HistoryIcon from "@mui/icons-material/History";
import NorthEast from "@mui/icons-material/NorthEast";
import SouthWest from "@mui/icons-material/SouthWest";
import { buscarMovimentacoes } from "../../store/slices/itensSlice"; // ajuste o caminho
import { selectOrganizacaoCodigo } from "../../store/slices/organizacaoSlice";
// import { selectOrganizacaoCodigo } from "..."; // o mesmo que você já usa no slice

const TIPOS = {
  entrada: { label: "Entrada", plural: "Entradas", sinal: "+", cor: "#0E8A5F", fundo: "#E3F5EC", Icone: NorthEast },
  saida: { label: "Saída", plural: "Saídas", sinal: "−", cor: "#1E2433", fundo: "#EEF0F5", Icone: SouthWest },
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatarData(iso) {
  const data = new Date(iso);
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (data.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
  if (data.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
  return `${data.getDate()} ${MESES[data.getMonth()]}, ${hora}`;
}

/* Hook: o "carregando" é derivado da chave, sem setState dentro do efeito
   (evita o aviso do ESLint que você viu antes). */
function useMovimentacoes({ tipo, limite }) {
  const codigoOrganizacao = useSelector(selectOrganizacaoCodigo);
  const chave = `${tipo}|${limite ?? "todas"}|${codigoOrganizacao}`;
  const [resultado, setResultado] = useState({ chave: null, dados: [], erro: null });

  useEffect(() => {
    if (!codigoOrganizacao) return;
    let cancelado = false;

    buscarMovimentacoes({ tipo, codigoOrganizacao, limite })
      .then((dados) => !cancelado && setResultado({ chave, dados, erro: null }))
      .catch((e) => !cancelado && setResultado({ chave, dados: [], erro: e.message }));

    return () => {
      cancelado = true; // ignora respostas antigas se o usuário trocar de tipo rápido
    };
  }, [chave, tipo, codigoOrganizacao, limite]);

  const carregando = resultado.chave !== chave;
  return {
    movimentacoes: resultado.dados,
    carregando,
    erro: carregando ? null : resultado.erro,
  };
}

/* ----------------------------- column: linha compacta ----------------------------- */

function LinhaCompacta({ tipo, mov: { produto, quantidade, criadoEm, origem } }) {
  const { label, sinal, cor, Icone } = TIPOS[tipo];

  return (
    <Box sx={{ py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 16, height: 16, flexShrink: 0, display: "grid", placeItems: "center",
            borderRadius: "3px", bgcolor: cor, color: "#fff",
          }}
        >
          <Icone sx={{ fontSize: 12 }} />
        </Box>
        <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: "0.875rem", color: "#1E2433" }}>
          {produto}
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: cor }}>
          {sinal}{quantidade}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mt: 0.5, pl: 3 }}>
        <Typography noWrap sx={{ fontSize: "0.75rem", color: "#6B7280" }}>
          {label} · {origem}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", flexShrink: 0 }}>
          {formatarData(criadoEm)}
        </Typography>
      </Box>
    </Box>
  );
}

/* ----------------------------- row: tabela com rolagem ----------------------------- */

function TabelaMovimentacoes({ tipo, movimentacoes, nomeUnidade }) {
  const { label, sinal, cor, fundo } = TIPOS[tipo];

  return (
    // flex: 1 + minHeight: 0 deixa só a tabela rolar; o cabeçalho do card fica fixo
    <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      <Table stickyHeader size="small">
        <TableHead
          sx={{
            "& th": {
              bgcolor: "#F6F7FB", color: "#8A91A5", fontSize: "0.6875rem",
              fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em",
            },
          }}
        >
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Origem</TableCell>
            <TableCell>Unidade</TableCell>
            <TableCell align="right">Quantidade</TableCell>
            <TableCell align="right">Data</TableCell>
          </TableRow>
        </TableHead>

        <TableBody sx={{ "& td": { fontSize: "0.875rem", color: "#1E2433" } }}>
          {movimentacoes.map(({ id, produto, origem, unidadeId, quantidade, criadoEm }) => (
            <TableRow key={id}>
              <TableCell>{produto}</TableCell>
              <TableCell>
                <Chip
                  label={label}
                  size="small"
                  sx={{ bgcolor: fundo, color: cor, fontWeight: 500, fontSize: "0.75rem", height: 22 }}
                />
              </TableCell>
              <TableCell sx={{ color: "#6B7280 !important" }}>{origem}</TableCell>
              <TableCell sx={{ color: "#6B7280 !important" }}>{nomeUnidade.get(unidadeId) ?? "—"}</TableCell>
              <TableCell align="right" sx={{ color: `${cor} !important`, fontWeight: 600 }}>
                {sinal}{quantidade}
              </TableCell>
              <TableCell align="right" sx={{ color: "#8A91A5 !important" }}>
                {formatarData(criadoEm)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* --------------------------------- componente --------------------------------- */

export default function UltimasMovimentacoes({ direction = "column", maxHeight = 360 }) {
  const [tipo, setTipo] = useState("entrada");
  const [anchorEl, setAnchorEl] = useState(null);

  const limite = direction === "column" ? 3 : undefined; // column: 3 mais recentes; row: todas
  const { movimentacoes, carregando, erro } = useMovimentacoes({ tipo, limite });

  const unidades = useSelector((state) => state.unidades.lista);
  const nomeUnidade = useMemo(() => new Map(unidades.map((u) => [u.id, u.nome])), [unidades]);

  let corpo;
  if (erro) {
    corpo = <Typography color="error" sx={{ px: 2.5, pb: 2.5, fontSize: "0.875rem" }}>{erro}</Typography>;
  } else if (carregando) {
    corpo = <Box sx={{ display: "grid", placeItems: "center", py: 4 }}><CircularProgress size={24} /></Box>;
  } else if (!movimentacoes.length) {
    corpo = <Typography sx={{ px: 2.5, pb: 2.5, fontSize: "0.875rem", color: "#6B7280" }}>Nenhuma movimentação.</Typography>;
  } else if (direction === "column") {
    corpo = (
      <Box sx={{ px: 2.5, pb: 2.5, pt: 1, "& > :last-of-type": { borderBottom: "1px solid", borderColor: "divider" } }}>
        {movimentacoes.map((mov) => <LinhaCompacta key={mov.id} tipo={tipo} mov={mov} />)}
      </Box>
    );
  } else {
    corpo = <TabelaMovimentacoes tipo={tipo} movimentacoes={movimentacoes} nomeUnidade={nomeUnidade} />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        maxHeight: direction === "row" ? maxHeight : "none", // o limite de altura só vale no row
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#1E2433", lineHeight: 1.2 }}>
            Últimas movimentações
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", color: "#6B7280" }}>{TIPOS[tipo].plural}</Typography>
        </Box>

        <IconButton aria-label="Escolher entre entradas e saídas" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <HistoryIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {Object.entries(TIPOS).map(([chave, { plural }]) => (
            <MenuItem
              key={chave}
              selected={chave === tipo}
              onClick={() => { setTipo(chave); setAnchorEl(null); }}
            >
              {plural}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {corpo}
    </Box>
  );
}