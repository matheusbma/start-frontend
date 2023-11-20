import Image from 'next/image';
import { useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import router from "next/router";

import cesarLogo from '../assets/cesar-logo.png';
import googleLogo from '../assets/google-logo.png';
import startLogo from '../assets/Start-laranja.png';

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
      <div className="flex flex-col items-center justify-center bg-white rounded-xl p-8">
        <div className="flex flex-row justify-betweenitems-center px-8">
          <h1 className="text-zinc-600 text-3xl mr-20 font-bold">Login</h1>
          <Image
            src={cesarLogo}
            alt='CESAR logo'
            height={40}
          />
        </div>

        <Image
        className='mt-10 mb-14'
          src={startLogo}
          alt='START logo'
          height={45}
        />

        <button
          className="flex h-12 w-64 px-8 justify-between items-center font-bold text-white bg-orange-600 rounded-3xl "
          onClick={handleSignIn}
        >
          <Image
            src={googleLogo}
            alt='Google logo'
            height={20}
          />
          Acessar com Google
        </button>
      </div>
    </main>
  );
}
