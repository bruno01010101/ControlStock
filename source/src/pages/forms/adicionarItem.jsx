import Form from "../../components/Form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { criarItem } from "../../store/slices/itensSlice";

export default function AdicionarItem() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const unidades = useSelector((state) => state.unidades.lista);
  const statusCriacao = useSelector((state) => state.itens.statusCriacao);

  // value = id da unidade, label = nome exibido
  const opcoesUnidades = unidades.map((u) => ({ value: u.id, label: u.nome }));

  async function handleSubmit(dados) {
    try {
      // codigo_organizacao é lido do slice de organização dentro do thunk
      await dispatch(
        criarItem({
          nome: dados.nome.trim(),
          codigo: dados.codigo?.trim(),
          categoria: dados.categoria?.trim(),
          unidade: dados.unidade, // id da unidade (o thunk converte para número)
          unidade_de_medida: dados.unidade_de_medida.trim(),
          estoque_minimo: dados.estoque_minimo,
        })
      ).unwrap();
      navigate("/itens"); // ajuste para a rota da sua lista de itens
    } catch (erro) {
      console.warn(erro);
    }
  }

  return (
    <Form
      size="large"
      logo="/favicon.svg"
      titulo="Crie o item"
      subtitulo="Cadastre um novo item para controlar seu estoque."
      textoBotao="Cadastrar"
      campos={[
        {
          name: "nome",
          label: "Nome",
          placeholder: "Digite o nome do item",
          full: true,
        },
        {
          name: "codigo",
          label: "Código (opcional)",
          placeholder: "Ex.: ITM-001",
          required: false,
        },
        {
          name: "categoria",
          label: "Categoria (opcional)",
          placeholder: "Ex.: Limpeza",
          required: false,
        },
        {
          name: "unidade",
          label: "Unidade",
          type: "combobox",
          placeholder: "Digite ou escolha a unidade",
          opcoes: opcoesUnidades,
        },
        {
          name: "unidade_de_medida",
          label: "Unidade de medida",
          placeholder: "Ex.: kg, un, L",
        },
        {
          name: "estoque_minimo",
          label: "Estoque mínimo",
          type: "number",
          min: 0,
          placeholder: "0",
        },
      ]}
      onSubmit={handleSubmit}
      carregando={statusCriacao === "loading"}
    />
  );
}
