

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
  let organizacao = null;

  if (!creatingOrg) {
    const { data, error } = await supabase
      .from("organizacoes")
      .select("id, codigo")
      .eq("codigo", orgValor.toUpperCase())
      .maybeSingle();

    if (error) {
      console.warn(error);
      return { error };
    }
    if (!data) {
      return { error: new Error("Código de organização não encontrado.") };
    }
    organizacao = data;
  }

  // 2. Cria o usuário
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
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

  // 3. Cria o profile (não há trigger)
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: user.id, email });

  if (profileError) {
    console.warn(profileError);
    return { error: profileError };
  }

  // 4. Organização nova: cria com o código gerado
  if (creatingOrg) {
    const { data, error } = await criarOrganizacao(orgValor);

    if (error) {
      console.warn(error);
      return { error };
    }
    organizacao = data;
  }

  // 5. Vincula usuário e organização, guardando o código na tabela intermediária
  const { error: vinculoError } = await supabase
  .from("organizacao_usuarios")
  .insert({
    organizacao_id: organizacao.id,
    usuario_id: user.id,
    codigo: organizacao.codigo,
  });
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