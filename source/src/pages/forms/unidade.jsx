import Form from "../../components/Form";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { criarUnidade } from "../../store/slices/unidadesSlice";
import { useNavigate } from "react-router";


export default function Unidade() {
  const dispatch = useDispatch();
  const statusCriacao = useSelector((state) => state.unidades.statusCriacao);
  const navigate = useNavigate()

  async function handleSubmit({ nome }) {
    try {
      await dispatch(criarUnidade({ nome: nome.trim() })).unwrap();
      navigate('/')
    } catch (erro) {
      console.warn(erro)
    }
  }

  return (
    <Form
      size="small"
      logo="/favicon.svg"
      titulo="Crie a unidade"
      subtitulo="Cadastre uma nova unidade para organizar seu estoque."
      textoBotao="Cadastrar"
      campos={[
        { name: "nome", label: "Nome", placeholder: "Dígite o nome da unidade", required: true},
      ]}
      onSubmit={handleSubmit}
      carregando={statusCriacao === 'loading'}
    />
  );
}