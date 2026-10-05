import { supabase } from "."

export function Cadastrar(){
    supabase.auth.signUp({
        email: "usuario@email.com",
        senha: "123456"
    }).then(({data, error}) => {
        if(error){
            console.warn(error)
        }
        else{
            console.log(data)
        }
    })
}