import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import Header from "../components/Header";
import UserCalendar from "../components/Calendar";
import Menu from "../components/Menu";

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
  const userName = session?.user?.name;
  const userShortName = session?.user?.name?.split(" ")[0];
  const userEmail = session?.user?.email;

  const [user, setUser] = useState<UserProps>(
    undefined as unknown as UserProps
  );
  const [eventsList, setEventsList] = useState<EventProps[]>([]);

  // Check if user exists in database
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
            setUser(user);
          } else {
            axios.post("http://localhost:8080/" + "usuarios", {
              matricula: session.user?.name?.split(" ")[0],
              nome: session.user?.name,
              email: session.user?.email,
              senha: "123456",
              acesso: "aluno",
              num_de_usos_maquina_1: 0,
              num_de_usos_maquina_2: 0,
              num_de_usos_maquina_3: 0,
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // Take events from database
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
    <div className="">
      <Header userImg={userImg ?? ""} userName={userShortName ?? ""} />
      <div className="flex flex-col justify-center sm:flex-row mt-12">
        {eventsList ? (
          <>
            <UserCalendar eventsList={eventsList} />
            <Menu
              user={user}
              userName={userName ?? ""}
              userImg={userImg ?? ""}
            />
          </>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold">Carregando...</h1>
            <div className="animate-spin mt-7 rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
}
