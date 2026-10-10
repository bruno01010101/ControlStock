import styles from "./form.module.css";

/**
 * Props:
 * - titulo:      título do card (ex.: "Bem vindo de volta")
 * - subtitulo:   texto abaixo do título
 * - campos:      array de { name, label, type?, placeholder?, required?, full? }
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
  function handleSubmit(e) {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.currentTarget));
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
            ({ name, label, type = "text", placeholder, required = true, full }) => (
              <div
                key={name}
                className={`${styles.campo} ${full ? styles.full : ""}`}
              >
                <label htmlFor={name}>{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  required={required}
                />
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
