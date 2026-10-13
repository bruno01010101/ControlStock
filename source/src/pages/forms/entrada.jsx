import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import Form from "../../components/Form"; // ajuste o caminho
import {
  criarEntrada,
  selectItensCarregando,
  selectItensDaUnidade,
} from "../../store/slices/itensSlice"; // ajuste
import { selectUnidadeSelecionada } from "../../store/slices/unidadesSlice"; // ajuste

const hoje = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD, horário local

export default function FormEntrada() {
  const { id } = useParams(); // undefined quando vem do botão geral
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const enviando = useRef(false); // trava síncrona contra cliques/Enter repetidos

  const itensCarregando = useSelector(selectItensCarregando);
  const unidade = useSelector(selectUnidadeSelecionada); // { id, nome, ... } ou null
  const itensDaUnidade = useSelector((state) =>
    selectItensDaUnidade(state, unidade?.id)
  );

  if (itensCarregando || !unidade) return <p>Carregando...</p>;

  // só pré-seleciona se o item da rota pertencer à unidade selecionada
  const itemDaRota = id
    ? itensDaUnidade.find((i) => String(i.id) === String(id))
    : null;

  const campos = [
    { name: "nome_solicitante", label: "Nome do solicitante", full: true },
    {
      name: "data_solicitacao",
      label: "Data da solicitação",
      type: "date",
      defaultValue: hoje(),
    },
    { name: "setor_solicitante", label: "Setor do solicitante", required: false },
    {
      name: "itens",
      type: "lista",
      textoAdicionar: "Adicionar item",
      iniciais: itemDaRota ? [{ item_id: itemDaRota.id }] : undefined,
      campos: [
        {
          name: "item_id",
          label: "Item",
          type: "combobox",
          placeholder: "Digite para buscar",
          opcoes: itensDaUnidade.map((i) => ({ value: i.id, label: i.nome })),
        },
        { name: "quantidade", label: "Quantidade", type: "number", min: 1 },
      ],
    },
  ];

  async function handleSubmit(dados) {
    if (enviando.current) return; // já tem um envio em andamento
    enviando.current = true;
    setSalvando(true);
    setErro(null);

    const resultado = await dispatch(
      criarEntrada({ ...dados, unidade: unidade.id })
    );

    if (criarEntrada.fulfilled.match(resultado)) {
      // mantém travado: o botão continua desabilitado até a página trocar
      navigate("/itens", { replace: true });
      return;
    }

    // erro: libera para o usuário corrigir e tentar de novo
    enviando.current = false;
    setSalvando(false);
    setErro(resultado.payload ?? "Não foi possível salvar a entrada");
  }

  return (
    <Form
      titulo="Dar entrada"
      subtitulo={`Unidade: ${unidade.nome}`}
      size="large"
      campos={campos}
      textoBotao="Salvar entrada"
      carregando={salvando}
      onSubmit={handleSubmit}
    >
      {erro && <p role="alert">{erro}</p>}
    </Form>
  );
}