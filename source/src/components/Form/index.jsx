import styles from "./form.module.css";

/**
 * Props:
 * - titulo:      título do card (ex.: "Bem vindo de volta")
 * - subtitulo:   texto abaixo do título
 * - campos:      array de { name, label, type?, placeholder?, required?, full?, min?, opcoes? }
 *                type "select" renderiza um <select> com opcoes: [{ value, label }]
 *                type "combobox" é um input com lista: digita para filtrar e só aceita
 *                uma das opcoes; o onSubmit recebe o value da opção (ex.: o id)
 * - textoBotao:  texto do botão de envio
 * - onSubmit:    função chamada com um objeto { name: valor, ... }
 * - size:        "small" (padrão) | "large"
 * - logo:        caminho da imagem exibida acima do card (ex.: "/logo.png" ou um import)
 * - carregando:  desabilita o botão enquanto envia
 * - children:    conteúdo extra entre os campos e o botão (ex.: "Esqueci minha senha")
 */
export default function Form({
  titulo,
  subtitulo,
  campos = [],
  textoBotao = "Enviar",
  onSubmit,
  size = "small",
  logo,
  carregando = false,
  children,
}) {
  // só aceita texto que seja exatamente o label de uma das opções
  function validarOpcao(e, opcoes) {
    const texto = e.target.value;
    const valido = texto === "" || opcoes.some((o) => o.label === texto);
    e.target.setCustomValidity(valido ? "" : "Escolha uma opção da lista");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.currentTarget));

    // no combobox o usuário vê o label; aqui trocamos pelo value (ex.: id)
    campos.forEach(({ name, type, opcoes = [] }) => {
      if (type === "combobox") {
        const opcao = opcoes.find((o) => o.label === dados[name]);
        dados[name] = opcao ? opcao.value : "";
      }
    });

    onSubmit?.(dados);
  }

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      {logo && (
        <div className={styles.cabecalho}>
          <img src={logo} alt="Logo" className={styles.logo} />
        </div>
      )}

      <form className={styles.card} onSubmit={handleSubmit}>
        {titulo && <h2 className={styles.titulo}>{titulo}</h2>}
        {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}

        <div className={styles.campos}>
          {campos.map(
            ({
              name,
              label,
              type = "text",
              placeholder,
              required = true,
              full,
              min,
              opcoes = [],
            }) => (
              <div
                key={name}
                className={`${styles.campo} ${full ? styles.full : ""}`}
              >
                <label htmlFor={name}>{label}</label>
                {type === "select" ? (
                  <select
                    id={name}
                    name={name}
                    required={required}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {placeholder ?? "Selecione"}
                    </option>
                    {opcoes.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : type === "combobox" ? (
                  <>
                    <input
                      id={name}
                      name={name}
                      list={`${name}-opcoes`}
                      placeholder={placeholder}
                      required={required}
                      autoComplete="off"
                      onInput={(e) => validarOpcao(e, opcoes)}
                    />
                    <datalist id={`${name}-opcoes`}>
                      {opcoes.map((o) => (
                        <option key={o.value} value={o.label} />
                      ))}
                    </datalist>
                  </>
                ) : (
                  <input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    min={min}
                  />
                )}
              </div>
            )
          )}
        </div>

        {children && <div className={styles.extra}>{children}</div>}

        <button type="submit" className={styles.botao} disabled={carregando}>
          {carregando ? "Enviando..." : textoBotao}
        </button>
      </form>
    </div>
  );
}
