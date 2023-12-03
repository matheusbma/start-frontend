import {
  formatMaquinaELaboratorioEvent,
  formatMesaEvent,
  formatData,
} from "@/utils/convert";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

import { FaEdit, FaArrowLeft } from "react-icons/fa";
import router from "next/router";

import DataTimeDialog from '../components/DataTimeDialog'

interface UserProps {
  id: number;
  email: string;
}

interface EventProps {
  id: number;
  idUsuario: number;
  idReserva: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  reserva: string;
}
[];

interface formattedEventProps {
  title: string;
  id: number;
  idUsuario: number;
  idReserva: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  reserva: string;
}

export default function Editor() {
  const { data: session, status } = useSession();

  const userEmail = session?.user?.email;

  const [user, setUser] = useState<UserProps>(
    undefined as unknown as UserProps
  );

  const [eventsList, setEventsList] = useState<EventProps[]>([]);
  const [formattedEvents, setFormattedEvents] = useState<formattedEventProps[]>(
    []
  );
  const [statusDialog, setStatusDialog] = useState(false);
  const [chooseEvent, setChooseEvent] = useState<formattedEventProps>({} as formattedEventProps);

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
            (event: { idUsuario: number }) => event.idUsuario === user.id
          );
          const validEvents = userEventsList.filter(
            (event: { data: string }) =>
              event.data >= format(new Date(), "yyyy-MM-dd")
          );
          setEventsList(validEvents);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [user]);

  useEffect(() => {
    async function processEvents() {
      const promises = eventsList.map(async (event) => {
        try {
          if (event.reserva === "mesa") {
            try {
              const response = await axios.get(
                `http://localhost:8080/mesa/${event.idReserva}`
              );
              const lab = response.data.idLaboratorio;
              const formatted = formatMesaEvent(event, lab);
              return {
                title: formatted.title,
                id: formatted.id,
                idUsuario: event.idUsuario,
                idReserva: event.idReserva,
                data: formatData(event.data),
                horaInicio: event.horaInicio,
                horaFim: event.horaFim,
                reserva: event.reserva,
              };
            } catch (error) {
              console.error("Error fetching labId: ", error);
            }
          } else {
            const formatted = formatMaquinaELaboratorioEvent(event);
            return {
              title: formatted.title,
              id: formatted.id,
              idUsuario: event.idUsuario,
              idReserva: event.idReserva,
              data: formatData(event.data),
              horaInicio: event.horaInicio,
              horaFim: event.horaFim,
              reserva: event.reserva,
            };
          }
        } catch (error) {
          console.error("Error formatting event: ", error);
          return null;
        }
      });
      const events = (await Promise.all(promises)).filter(Boolean);
      setFormattedEvents(events as formattedEventProps[]);
    }

    processEvents();
  }, [eventsList]);

  function handleBack() {
    router.back();
  }

  function handleOpenDialog(event: formattedEventProps) {
    setChooseEvent(event)
    setStatusDialog(true)
  }

  function handleCloseDialog() {
    setChooseEvent({} as formattedEventProps)
    setStatusDialog(false)
    router.reload()
  }

  function handleDeleteAgendamento(eventId: number) {
    axios.delete(`http://localhost:8080/agendamentos/${eventId}`)
    .then((response) => {
      alert("Agendamento deletado com sucesso!")
      router.reload()
    })
    .catch((error) => {
      console.log(error)
    })
  }

  return (
    <div className="flex flex-col h-full w-full justify-center items-center">
      <button className="h-6 w-6 self-start m-8" onClick={handleBack}>
        <FaArrowLeft className="h-6 w-6 text-white" />
      </button>
      <div className="flex flex-col justify-center  max-w-screen-lg bg-white rounded-xl">
      <div className="flex flex-col items-center mt-5">
          <h1 className="text-orange-500 text-xl font-extrabold">
            Editar Horário
          </h1>
        </div>
        {formattedEvents.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-12">
            <h1 className="text-2xl text-orange-500 self-center">
              Sem Agendamentos.
            </h1>
          </div>
        ) : (
          <div className="grid grid-cols-3 m-6">
            {formattedEvents.map((event) => (
              <div
                className="flex flex-row bg-slate-100 justify-between h-[130px] px-4 py-4 m-3 rounded-xl"
                key={event.id}
              >
                <DataTimeDialog open={statusDialog} onClose={handleCloseDialog} event={chooseEvent}/>
                <div className="flex flex-col justify-between">
                  <p className="text-orange-500 font-bold">{event.title}</p>
                  <p className="text-orange-500">{event.data}</p>
                  <p className="text-orange-500">
                    {event.horaInicio} - {event.horaFim}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-between py-2 ml-9">
                  <button className="h-6 w-6" onClick={() => {
                    handleOpenDialog(event)
                  }}>
                    <FaEdit className="h-6 w-6 text-orange-500" />
                  </button>
                  <button onClick={() => {
                    handleDeleteAgendamento(event.id)
                  }}>
                    <div className="font-semibold text-3xl mr-1.5 text-red-700">X</div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
