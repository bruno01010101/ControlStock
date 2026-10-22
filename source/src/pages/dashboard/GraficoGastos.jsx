import { LineChart } from "@mui/x-charts/LineChart";

const COR = "#2563eb"; // mesmo azul do restante do dashboard
const COR_TEXTO = "#6b7280";
const COR_GRADE = "#e5e7eb";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const compacto = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

// "2026-01-01" -> "Jan"
const abreviarMes = (data) => {
  const texto = new Date(`${data}T00:00:00`)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// 12000 -> "12 mil"
const eixoY = (valor) => (valor >= 1000 ? `${compacto.format(valor / 1000)} mil` : inteiro.format(valor));

// Até este número de meses, o valor aparece em cima de cada ponto;
// acima disso só no último, para os números não ficarem amontoados.
const LIMITE_ROTULOS = 8;

// Bolinha de cada mês + o valor em cima dela (substitui o marcador padrão do MUI)
function Marcador({ x, y, dataIndex, valores, mostrarTodos }) {
  const ultimo = dataIndex === valores.length - 1;
  const mostrar = mostrarTodos || ultimo;

  return (
    <g>
      <circle cx={x} cy={y} r={4} fill={ultimo ? COR : "#fff"} stroke={COR} strokeWidth={2} />
      {mostrar && (
        <text
          x={x}
          y={y - 12}
          textAnchor="middle"
          fontSize={12}
          fontWeight={ultimo ? 700 : 400}
          fill={ultimo ? COR : "#374151"}
        >
          {inteiro.format(valores[dataIndex])}
        </text>
      )}
    </g>
  );
}

/**
 * Gráfico de linha dos gastos mês a mês.
 * meses: [{ mes: "2026-01-01", total: 6200 }, ...] (é o `por_mes` da função gastos_dashboard)
 */
export default function GraficoGastos({ meses = [], altura = 220 }) {
  const valores = meses.map((m) => Number(m.total));

  return (
    <LineChart
      height={altura}
      margin={{ top: 28, right: 28, bottom: 8, left: 0 }}
      grid={{ horizontal: true }}
      hideLegend
      xAxis={[
        {
          data: meses.map((m) => m.mes),
          scaleType: "point",
          valueFormatter: abreviarMes,
          disableLine: true,
          disableTicks: true,
        },
      ]}
      yAxis={[
        {
          min: 0,
          valueFormatter: eixoY,
          disableLine: true,
          disableTicks: true,
          width: 48,
        },
      ]}
      series={[
        {
          data: valores,
          color: COR,
          curve: "linear",
          showMark: true,
          valueFormatter: (valor) => moeda.format(valor ?? 0),
        },
      ]}
      slots={{ mark: Marcador }}
      slotProps={{
        mark: { valores, mostrarTodos: meses.length <= LIMITE_ROTULOS },
      }}
      sx={{
        "& .MuiChartsGrid-line": { stroke: COR_GRADE, strokeDasharray: "0" },
        "& .MuiChartsAxis-tickLabel, & .MuiChartsAxis-tickLabel tspan": {
          fill: `${COR_TEXTO} !important`,
          fontSize: 12,
        },
      }}
    />
  );
}
