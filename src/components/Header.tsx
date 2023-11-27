import Image from "next/image";

import startLogo from "../assets/Start-laranja.png";
import router from "next/router";

interface HeaderProps {
  userImg: string;
  userName: string;
}

export default function Header({ userImg, userName }: HeaderProps) {
  const camelUserName =
    userName.charAt(0).toUpperCase() + userName.toLowerCase().slice(1);

  function handleHome() {
    router.push("/home");
  }

  return (
    <div className="flex flex-row justify-between items-center max-w-screen px-6 bg-white h-[4rem] rounded-md">
      <button className="flex items-center" onClick={handleHome}>
        <Image src={startLogo} alt="START logo" height={18} priority />
      </button>
      {/* <div className="flex flex-row items-center justify-center">
        <p className="text-orange-500 font-semibold text-md px-3">
          {camelUserName}
        </p>
        <img
          className="flex right-0 top-0 object-cover w-10 h-10 rounded-xl"
          src={userImg}
          alt="Imagem do usuário"
        />
      </div> */}
    </div>
  );
}
