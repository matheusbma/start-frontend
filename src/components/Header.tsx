import { useSession, signIn, signOut } from "next-auth/react";

interface HeaderProps {
  userImg: string;
  userName: string;
}

export default function Header( { userImg, userName }: HeaderProps) {
  return (
    <div className="flex flex-row justify-between items-center max-w-screen px-6 bg-white h-[6rem] rounded-md">
      <p className="text-zinc-700 font-bold text-3xl">S.T.A.R.T.</p>
      <div className="flex flex-row items-center justify-center">
        <p className="text-zinc-700 text-lg px-4">{userName}</p>
        <img
          className="flex right-0 top-0 object-cover w-14 h-14 rounded-xl"
          src={userImg}
          alt="Imagem do usuário"
        />
      </div>
    </div>
  );
}
