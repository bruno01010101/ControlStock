import { useRef, useState } from "react";
import styles from "./form.module.css";

/** texto digitado -> value da opção (no combobox o usuário digita o label) */
function valorDoCampo({ type, opcoes = [] }, texto) {
  if (type !== "combobox") return texto;
  const opcao = opcoes.find((o) => o.label === texto);
  return opcao ? opcao.value : "";
}

/** value da opção -> label exibido no input (usado no valor inicial) */
function rotuloDaOpcao(opcoes, valor) {
  if (valor == null) return "";
  return opcoes.find((o) => String(o.value) === String(valor))?.label ?? "";
}

// só aceita texto que seja exatamente o label de uma das opções
function validarOpcao(e, opcoes) {
  const texto = e.target.value;
  const valido = texto === "" || opcoes.some((o) => o.label === texto);
  e.target.setCustomValidity(valido ? "" : "Escolha uma opção da lista");
}

/** monta o array de linhas de um campo "lista" a partir do FormData */
function lerLista(formData, lista) {
  const colunas = lista.campos.map((c) =>
    formData.getAll(`${lista.name}.${c.name}`)
  );
  const total = colunas[0]?.length ?? 0;

  return Array.from({ length: total }, (_, i) =>
    Object.fromEntries(
      lista.campos.map((c, j) => [c.name, valorDoCampo(c, colunas[j][i])])
    )
  );
}

/** Um campo (label + input/select/combobox). */
function Campo({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required = true,
  full,
  min,
  opcoes = [],
  defaultValue,
}) {
  return (
    <div className={`${styles.campo} ${full ? styles.full : ""}`}>
      <label htmlFor={id}>{label}</label>
      {type === "select" ? (
        <select
          id={id}
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
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
            id={id}
            name={name}
            list={`${id}-opcoes`}
            placeholder={placeholder}
            required={required}
            autoComplete="off"
            defaultValue={rotuloDaOpcao(opcoes, defaultValue)}
            onInput={(e) => validarOpcao(e, opcoes)}
          />
          <datalist id={`${id}-opcoes`}>
            {opcoes.map((o) => (
              <option key={o.value} value={o.label} />
            ))}
          </datalist>
        </>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          min={min}
          defaultValue={defaultValue}
        />
      )}
    </div>
  );
}

/** Linhas repetíveis de campos, com botão + e ×. */
function Lista({ name, campos, iniciais, textoAdicionar = "Adicionar" }) {
  const proximaChave = useRef(0);
  const novaLinha = (valores = {}) => ({
    chave: proximaChave.current++,
    valores,
  });

  const [linhas, setLinhas] = useState(() =>
    (iniciais?.length ? iniciais : [{}]).map((valores) => novaLinha(valores))
  );

  return (
    <div className={`${styles.lista} ${styles.full}`}>
      {linhas.map(({ chave, valores }) => (
        <div key={chave} className={styles.linha}>
          {campos.map((c) => (
            <Campo
              key={c.name}
              {...c}
              id={`${name}-${c.name}-${chave}`}
              name={`${name}.${c.name}`}
              defaultValue={valores[c.name] ?? c.defaultValue}
            />
          ))}
          {linhas.length > 1 && (
            <button
              type="button"
              className={styles.remover}
              aria-label="Remover linha"
              onClick={() =>
                setLinhas((atual) => atual.filter((l) => l.chave !== chave))
              }
            >
              ×
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        className={styles.adicionar}
        onClick={() => setLinhas((atual) => [...atual, novaLinha()])}
      >
        + {textoAdicionar}
      </button>
    </div>
  );
}

/**
 * Props:
 * - titulo, subtitulo, textoBotao, size, logo, carregando, children: como antes
 * - campos: array de { name, label, type?, placeholder?, required?, full?, min?, opcoes?, defaultValue? }
 *     type "select" | "combobox": como antes
 *     type "lista": { name, textoAdicionar?, iniciais?, campos: [...] }
 *       renderiza linhas repetíveis; o onSubmit recebe um array de objetos
 *       em dados[name]. `iniciais` é um array de valores da(s) primeira(s) linha(s).
 * - defaultValue: valor inicial (no combobox, o value da opção, ex.: o id)
 * - onSubmit: chamada com { name: valor, ... }
 * - onCampoChange: chamada a cada alteração com (name, valor digitado)
 */
export default function Form({
  titulo,
  subtitulo,
  campos = [],
  textoBotao = "Enviar",
  onSubmit,
  onCampoChange,
  size = "small",
  logo,
  carregando = false,
  children,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dados = Object.fromEntries(formData);

    campos.forEach((campo) => {
      if (campo.type === "combobox") {
        dados[campo.name] = valorDoCampo(campo, dados[campo.name]);
      }
      if (campo.type === "lista") {
        // remove as chaves soltas "itens.item_id" e troca pelo array
        campo.campos.forEach((c) => delete dados[`${campo.name}.${c.name}`]);
        dados[campo.name] = lerLista(formData, campo);
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

      <form
        className={styles.card}
        onSubmit={handleSubmit}
        onChange={(e) => onCampoChange?.(e.target.name, e.target.value)}
      >
        {titulo && <h2 className={styles.titulo}>{titulo}</h2>}
        {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}

        <div className={styles.campos}>
          {campos.map((campo) =>
            campo.type === "lista" ? (
              <Lista key={campo.name} {...campo} />
            ) : (
              <Campo key={campo.name} {...campo} id={campo.name} />
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