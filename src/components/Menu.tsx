import { convertToCamelCase } from "@/utils/convert";
import { signOut, useSession } from "next-auth/react";
import router from "next/router";
import { useEffect, useState } from "react";

interface MenuProps {
  user: {
    id: number;
    matricula: string;
    nome: string;
    email: string;
    senha: string;
    acesso: string;
    num_de_usos_maquina_1: number;
    num_de_usos_maquina_2: number;
    num_de_usos_maquina_3: number;
  };
  userName: string;
  userImg: string;
}

const buttonStyle =
  "flex justify-center items-center font-light text-xs text-white bg-orange-500 rounded-3xl h-8 w-40";

export default function Menu({ user, userName, userImg }: MenuProps) {
  const { data: session, status } = useSession();
  const [acesso, setAcesso] = useState<string>("");
  const [usosMaquina1, setUsosMaquina1] = useState<number>(0);
  const [usosMaquina2, setUsosMaquina2] = useState<number>(0);
  const [usosMaquina3, setUsosMaquina3] = useState<number>(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  function handleCreateSchedule() {
    router.push("/agendamento");
  }

  function handleEditSchedule() {
    router.push("/editor");
  }

  function handleSignOut() {
    signOut();
  }

  useEffect(() => {
    if (user) {
     const convertedAcesso = convertToCamelCase(user.acesso);
      setAcesso(convertedAcesso);
      setUsosMaquina1(user.num_de_usos_maquina_1);
      setUsosMaquina2(user.num_de_usos_maquina_2);
      setUsosMaquina3(user.num_de_usos_maquina_3);
    }
  }, [user]);

  return (
    <div>
      <div className="flex flex-col justify-between py-5 px-[1.4rem] ml-10 h-max w-[350px] bg-white rounded-xl">
        <div className="flex flex-col justify-center items-center ">
          <img
            className="flex object-cover w-24 rounded-xl mb-4"
            src={userImg}
            alt="Imagem do usuário"
          />
          <h1 className="text-orange-500 text-sm text-center font-bold">{userName}</h1>
          <h2 className="text-orange-500 text-sm"> - {acesso} - </h2>
        <h1 className="text-orange-500 mt-[-10px]">____________________________________</h1>
        </div>


          <div className="flex flex-row mt-2 justify-end">
            <div className="flex flex-col items-center justify-center">
            <p className="flex pr-1 text-xs text-orange-500">
              Usos da Máquina 1:
            </p>
            <p className="flex pr-1 text-xs text-orange-500">
              Usos da Máquina 2:
            </p>
            <p className="flex mr-1 text-xs text-orange-500">
              Usos da Máquina 3:
            </p>
            </div>
            <div className="flex flex-col items-center justify-center">
            <p className="flex text-xs font-bold text-orange-500">
              {usosMaquina1}
            </p>
            <p className="flex text-xs font-bold text-orange-500">
              {usosMaquina3}
            </p>
            <p className="flex text-xs font-bold text-orange-500">
              {usosMaquina2}
            </p>
            </div>
          </div>

        <div className="flex flex-col items-center justify-between mt-10 h-32">
          <button className={buttonStyle} onClick={handleCreateSchedule}>
            Criar Agendamento
          </button>
          <button className={buttonStyle} onClick={handleEditSchedule}>
            Editar Agendamento
          </button>
          <button className={buttonStyle} onClick={handleSignOut}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
