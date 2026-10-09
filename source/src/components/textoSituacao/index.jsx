import styles from "./textoSitaucao.module.css";

export default function TextoSitaucao({ situacao = 'bom', text }) {
    let cor = null;
    if(situacao === "mid"){
        cor = "#f39d2c";
    }else if (situacao === "bom"){
        cor = "oklch(53.81% 0.15405 148.442)";
    }else{
        cor = "oklch(63.7% 0.237 25.331)";
    }

    return (
    <div className={styles[situacao]}>
        <div className={styles.circle} style={{backgroundColor: cor}}></div>
        <p>
            {text}
        </p>
    </div>
    )
}   