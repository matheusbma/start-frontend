import axios from "axios";
import router from "next/router";
import { use, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

import Header from "../components/Header";
import UserCalendar from "../components/Calendar";
import moment from "moment";
import { convertToCamelCase } from "@/utils/convert";

interface UserProps {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  senha: string;
  acesso: string;
  num_de_usos_maquina_1: number;
  num_de_usos_maquina_2: number;
  num_de_usos_maquina_3: number;
}

interface EventProps {
  id: number;
  id_usuario: number;
  id_reserva: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  reserva: string;
}

export default function home() {
  const { data: session, status } = useSession();

  const userImg = session?.user?.image;
  const userName = session?.user?.name?.split(" ")[0];
  const userEmail = session?.user?.email;

  const [user, setUser] = useState<UserProps>();
  const [eventsList, setEventsList] = useState<EventProps[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  function handleSignOut() {
    signOut();
  }

  if (!user) {
    if (session) {
      axios
        .get("http://localhost:8080/" + "usuarios")
        .then((response) => {
          const users = response.data;
          const user = users.find(
            (user: { email: string }) => user.email === userEmail
          );
          if (user) {
            console.log(user);
            setUser(user);
          } else {
            axios
            .post("http://localhost:8080/" + "usuarios", {
              matricula: session.user?.email?.split("@")[0],
              nome: session.user?.name,
              email: session.user?.email,
              senha: "123456",
              acesso: "aluno",
              num_de_usos_maquina_1: 0,
              num_de_usos_maquina_2: 0,
              num_de_usos_maquina_3: 0,
            })
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  useEffect(() => {
    if (user) {
      axios
        .get("http://localhost:8080/" + "agendamentos")
        .then((response) => {
          const events = response.data;
          const userEventsList = events.filter(
            (event: { id_usuario: number }) => event.id_usuario === user.id 
          );
          setEventsList(userEventsList);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [user]);

  return (
    <div>
      <Header userImg={userImg ?? ""} userName={userName ?? ""} />
      <div className="flex min-h-screen flex-col items-center mt-8 p-0">
        {eventsList ? (
          <UserCalendar eventsList={eventsList} />
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold">Carregando...</h1>
            <div className="animate-spin mt-7 rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        <button
          className="flex items-center mt-10 mb-32 text-orange-600 p-6 bg-white rounded-3xl h-10"
          onClick={handleSignOut}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
