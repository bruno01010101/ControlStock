import { Outlet, Navigate } from "react-router";
import { VerificaLogin } from "../../supabase/storageFunctions";
import { useEffect, useState } from "react";

export default function ProtectedRoute() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const func = async () => {
            const session = await VerificaLogin();

            setSession(session);
            setLoading(false);
        };

        func();
    }, []);

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (session) {
        return <Outlet />;
    }

    return <Navigate to="/auth/login" />;
}