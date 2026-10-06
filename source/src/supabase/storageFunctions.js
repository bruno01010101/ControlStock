import { supabase } from "."

export function Cadastrar(email, password){
    supabase.auth.signUp({
        email,
        password
    }).then(({error}) => {
        if(error){
            console.warn(error)
        }
    })
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