import styles from './auth.module.css';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Cadastrar, Logar } from '../../supabase/storageFunctions';

export default function Auth({ type }) {
  const url = type === 'login' ? '/auth/cadastro' : '/auth/login'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [org, setOrg] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(true);

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (type === 'login') {
      await Logar(email, senha)
      navigate('/itens')
    }
    else if (type === 'cadastro') {
      Cadastrar(email, senha, creatingOrg, org)
      navigate('/auth/login')
    }
  }

  return (
    <div className={styles.tudo}>
      <div className={styles.title}>
        <img src="/favicon.svg" alt="ControlStock Logo" className={styles.logo} />
        <div style={{ lineHeight: "1.2" }}>
          <h1 className={styles.h1}>Control Stock</h1>
          <p className={styles.p}>Gestão de estoque</p>
        </div>
      </div>
      <main className={styles.main}>
        <h2 style={{ paddingBottom: "0.5rem" }}>Bem vindo de volta</h2>
        <p className={styles.p}>{type === 'login' ? 'Entre na sua' : 'Crie uma'} conta para gerenciar seu estoque</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="" placeholder='seuemail@empresa.com' value={email} onChange={(v) => setEmail(v.target.value)} />
          <label htmlFor="email">Senha</label>
          <input type="password" name="senha" id="" placeholder='Digite sua senha' value={senha} onChange={(v) => setSenha(v.target.value)} />
          {type === 'cadastro' && (
            <>
              <div style={{ display: 'flex', justifyContent: "space-between" }}>

                <label htmlFor="text">Organização</label>
                <button
                  type="button"
                  onClick={() => setCreatingOrg((prev) => !prev)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    marginTop: 4,
                    fontSize: 12,
                    color: "#2563eb",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {creatingOrg ? "Já tenho um código de organização" : "Criar uma nova organização"}
                </button>
              </div>


              <input type="text" name="text" id="" placeholder={creatingOrg ? "Criar uma nova organização" : "Dígite o código da sua organização"} value={org} onChange={(v) => setOrg(v.target.value)} />
            </>
          )}
          <p className={styles.blue}>Esqueci minha senha</p>
          <input type="submit" value={type === 'login' ? 'Entrar' : 'Cadastrar'} className={styles.button} />
        </form>
      </main>
      <p className={styles.p}>{type === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta'} <Link to={url} style={{ color: '#2563EB' }}>{type === 'login' ? 'Faça seu cadastro clicando aqui!' : 'Faça seu login clicando aqui!'}</Link></p>
    </div>
  );
}