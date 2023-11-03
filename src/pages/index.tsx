import { useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import router from "next/router";

export default function Home() {
  const { data: session, status } = useSession();

  function handleSignIn() {
    signIn("google");
  }

  useEffect(() => {
    if (status === "authenticated") {
      const domain = session?.user?.email?.split("@")[1];
      if (domain == "cesar.school" || domain == "cesar.org") {
        router.push("/calendar");
      } else {
        signOut();
        alert(
          "Acesso negado! Você não está tentando logar com um e-mail do CESAR."
        );
      }
    }
  }, [status]);

  return (
    <main className="flex min-h-screen flex-col justify-center items-center">
      <h1 className="text-[9rem] font-bold">S.T.A.R.T</h1>
      <h2 className="text-6xl">GARAGINO</h2>

      <button
        className="flex items-center mt-10 mb-32 text-orange-600 p-6 bg-white rounded-3xl h-10"
        onClick={handleSignIn}
      >
        ENTRAR
      </button>
    </main>
  );
}
