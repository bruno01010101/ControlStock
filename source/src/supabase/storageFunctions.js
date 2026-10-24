

import { supabase } from "./"; // ajuste o caminho

// Sem I, O, 0 e 1 para não confundir na hora de digitar
const CARACTERES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function gerarCodigo(tamanho = 8) {
  let codigo = "";
  for (let i = 0; i < tamanho; i++) {
    codigo += CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
  }
  return codigo;
}

// Cria a organização com um código único. Se o código já existir (violação da
// constraint unique, erro 23505), gera outro e tenta de novo.
async function criarOrganizacao(nome) {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const { data, error } = await supabase
      .from("organizacoes")
      .insert({ nome, codigo: gerarCodigo() })
      .select("id, codigo")
      .single();

    if (!error) return { data };
    if (error.code !== "23505") return { error };
  }
  return { error: new Error("Não foi possível gerar um código único. Tente novamente.") };
}

// Mantenha seus imports atuais (supabase, criarOrganizacao).

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buscarOrganizacaoPorCodigo(codigo) {
  return supabase
    .from("organizacoes")
    .select("id, codigo")
    .eq("codigo", codigo.trim().toUpperCase())
    .maybeSingle();
}

// ---------------------------------------------------------------------------
// Etapa que exige sessão: profile + organização + vínculo.
// É idempotente, então pode ser chamada mais de uma vez sem duplicar nada.
// ---------------------------------------------------------------------------

async function executarFinalizacao(user) {
  const pendente = user.user_metadata?.pending_org;

  // Nada pendente: cadastro já foi concluído antes.
  if (!pendente) return { error: null };

  const { creatingOrg, valor } = pendente;

  // 1. Profile (não há trigger). upsert evita erro se já existir.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id" });

  if (profileError) {
    console.warn(profileError);
    return { error: profileError };
  }

  // 2. Se o vínculo já existe, não cria organização de novo.
  const { data: vinculoExistente, error: vinculoLookupError } = await supabase
    .from("organizacao_usuarios")
    .select("organizacao_id")
    .eq("usuario_id", user.id)
    .limit(1)
    .maybeSingle();

  if (vinculoLookupError) {
    console.warn(vinculoLookupError);
    return { error: vinculoLookupError };
  }

  if (!vinculoExistente) {
    // 3. Obtém a organização: cria uma nova ou localiza pelo código.
    let organizacao;

    if (creatingOrg) {
      const { data, error } = await criarOrganizacao(valor);
      if (error) {
        console.warn(error);
        return { error };
      }
      organizacao = data;
    } else {
      const { data, error } = await buscarOrganizacaoPorCodigo(valor);
      if (error) {
        console.warn(error);
        return { error };
      }
      if (!data) {
        return { error: new Error("Código de organização não encontrado.") };
      }
      organizacao = data;
    }

    // 4. Vincula usuário e organização.
    const { error: vinculoError } = await supabase
      .from("organizacao_usuarios")
      .insert({
        organizacao_id: organizacao.id,
        usuario_id: user.id,
        codigo: organizacao.codigo,
      });

    if (vinculoError) {
      console.warn(vinculoError);
      return { error: vinculoError };
    }
  }

  // 5. Limpa a pendência (null remove a chave do user_metadata).
  const { error: metaError } = await supabase.auth.updateUser({
    data: { pending_org: null },
  });
  if (metaError) console.warn(metaError);

  return { error: null };
}

// Guarda contra execução simultânea: quando o signUp já devolve sessão, o
// onAuthStateChange também dispara SIGNED_IN, e sem isso a organização
// poderia ser criada duas vezes.
let finalizacaoEmCurso = null;

export function finalizarCadastro(user) {
  if (!finalizacaoEmCurso) {
    finalizacaoEmCurso = executarFinalizacao(user).finally(() => {
      finalizacaoEmCurso = null;
    });
  }
  return finalizacaoEmCurso;
}

// ---------------------------------------------------------------------------
// Cadastro
// ---------------------------------------------------------------------------

export async function Cadastrar(email, password, creatingOrg, org) {
  const orgValor = org?.trim();

  if (!orgValor) {
    return {
      error: new Error(
        creatingOrg ? "Informe o nome da organização." : "Informe o código da organização."
      ),
    };
  }

  // 1. Organização existente: valida o código ANTES de criar o usuário,
  //    para não deixar um usuário órfão se o código estiver errado.
  if (!creatingOrg) {
    const { data, error } = await buscarOrganizacaoPorCodigo(orgValor);

    if (error) {
      console.warn(error);
      return { error };
    }
    if (!data) {
      return { error: new Error("Código de organização não encontrado.") };
    }
  }

  // 2. Cria o usuário. Os dados da organização vão junto no user_metadata,
  //    para que o processo possa continuar depois da confirmação do e-mail
  //    (inclusive se o usuário confirmar em outro navegador ou dispositivo).
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { pending_org: { creatingOrg, valor: orgValor } },
    },
  });

  if (signUpError) {
    console.warn(signUpError);
    return { error: signUpError };
  }

  const user = authData.user;

  // Com confirmação de e-mail ligada, e-mail já cadastrado não retorna erro,
  // mas devolve identities vazio.
  if (!user || user.identities?.length === 0) {
    return { error: new Error("Este e-mail já está cadastrado.") };
  }

  // 3. Sem sessão: a policy bloqueia profile/organização/vínculo.
  //    Avisa a UI para pedir a confirmação do e-mail; o resto roda depois.
  if (!authData.session) {
    return { user, pendingConfirmation: true, error: null };
  }

  // 4. Com sessão: conclui agora (profile, organização e vínculo).
  const { error: finalizacaoError } = await finalizarCadastro(user);

  if (finalizacaoError) {
    return { user, error: finalizacaoError };
  }

  return { user, pendingConfirmation: false, error: null };
}

// ---------------------------------------------------------------------------
// Continuação após confirmação de e-mail.
// Chame UMA vez na inicialização do app (ex.: no App.jsx / main.jsx).
// Retorna a função para cancelar a inscrição.
// ---------------------------------------------------------------------------

export function registrarFinalizacaoPosConfirmacao() {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    const pendente = session?.user?.user_metadata?.pending_org;

    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && pendente) {
      // setTimeout evita travar o cliente do Supabase ao chamar outras
      // funções dele de dentro do callback.
      setTimeout(() => {
        finalizarCadastro(session.user).then(({ error }) => {
          if (error) console.warn("Falha ao concluir cadastro:", error);
        });
      }, 0);
    }
  });

  return () => data.subscription.unsubscribe();
}

export async function Logar(email, password){
    const {data, error} = await supabase.auth.signInWithPassword({email, password})
    console.warn(error)
}

export async function VerificaLogin() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.warn(error);
        return null;
    }

    return data.session;
} 

export async function logout() {
    return await supabase.auth.signOut();
}