import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { use, useEffect, useState } from "react";
import axios from "axios";
import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { useRouter } from "next/router";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

interface UserProps {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  senha: string;
  acesso: string;
  numDeUsosMaquina1: number;
  numDeUsosMaquina2: number;
  numDeUsosMaquina3: number;
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

const buttonStyle =
  "flex justify-center items-center font-light text-xs text-white bg-orange-500 rounded-md h-8 w-24";
const disableButtonStyle =
  "flex justify-center items-center font-light text-xs text-white bg-zinc-400 rounded-md h-8 w-24";
const labCapacities: { [lab: string]: number } = {
  lab1: 16,
  lab2: 14,
};
const incrementInMinutes: number = 60;
const openingTime: Date = setHours(setMinutes(new Date(), 0), 8);
const closingTime: Date = setHours(setMinutes(new Date(), 0), 18);

export default function Agendamento() {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProps | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<"mesa" | "maquina" | "laboratorio" >("mesa");
  const [horarioInicioAgendamento, setHorarioInicioAgendamento] =useState<Date>();
  const [horarioFimAgendamento, setHorarioFimAgendamento] = useState<Date>();

  const [mesaScheduleOnDay, setMesaScheduleOnDay] = useState<EventProps[]>([]);
  const [maquinaScheduleOnDay, setMaquinaScheduleOnDay] = useState<EventProps[]>([]);
  const [labScheduleOnDay, setLabScheduleOnDay] = useState<EventProps[]>([]);
  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);

  if (!user) {
    if (session) {
      axios
        .get("http://localhost:8080/" + "usuarios")
        .then((response) => {
          const users = response.data;
          const user = users.find(
            (user: { email: string }) => user.email === session.user?.email
          );
          if (user) {
            setUser(user);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar o usuário:", error);
        });
    }
  }

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      const response = await axios(`http://localhost:8080/agendamentos`).then(
        (response) => {
          const events = response.data;
          const mesaEvents = events.filter(
            (event: { reserva: string }) => event.reserva === "mesa"
          );
          const maquinaEvents = events.filter(
            (event: { reserva: string }) => event.reserva === "maquina"
          );
          const labEvents = events.filter(
            (event: { reserva: string }) => event.reserva === "laboratorio"
          );
          const mesaEventsOnDate = mesaEvents.filter(
            (event: { data: string }) => event.data === formattedDate
          );
          const maquinaEventsOnDate = maquinaEvents.filter(
            (event: { data: string }) => event.data === formattedDate
          );
          const labEventsOnDate = labEvents.filter(
            (event: { data: string }) => event.data === formattedDate
          );
          return {
            mesa: mesaEventsOnDate,
            maquina: maquinaEventsOnDate,
            lab: labEventsOnDate,
          };
        }
      );
      setMesaScheduleOnDay(response.mesa);
      setMaquinaScheduleOnDay(response.maquina);
      setLabScheduleOnDay(response.lab);
    } catch (error) {
      console.error("Erro ao buscar os horários:", error);
    }
  };

  const handleTypeChange = (type: "mesa" | "maquina" | "laboratorio") => {
    setSelectedType(type);
  };

  function handleBack() {
    router.back();
  }

  // Dentro do useEffect que calcula os horários disponíveis de início:
  useEffect(() => {
    const startTime = setHours(setMinutes(selectedDate, 0), 8);
    const endTime = setHours(setMinutes(selectedDate, 0), 18);

    let timesStart = [];
    let currentTimeStart = startTime;

    while (isBefore(currentTimeStart, endTime)) {
      timesStart.push(currentTimeStart);
      currentTimeStart = addMinutes(currentTimeStart, incrementInMinutes);
    }

    const bookedTimes = mesaScheduleOnDay.map((reservation) => ({
      start: parseISO(reservation.data + " " + reservation.horaInicio),
      end: parseISO(reservation.data + " " + reservation.horaFim),
    }));

    const newAvailableStartTimes = timesStart
      .filter((startTime) => {
        return !bookedTimes.some(
          (bookedTime) =>
            isBefore(startTime, bookedTime.end) &&
            (isAfter(startTime, bookedTime.start) ||
              isEqual(startTime, bookedTime.start))
        );
      })
      .map((time) => format(time, "HH:mm"));
    setAvailableStartTimes(newAvailableStartTimes);
  }, [mesaScheduleOnDay, selectedDate]);

  // useEffect para calcular os horários disponíveis de término (fim)
 // Dentro do useEffect para calcular os horários disponíveis de término (fim)
useEffect(() => {
  if (!horarioInicioAgendamento) {
    setAvailableEndTimes([]);
    return;
  }

  const endTime = setHours(setMinutes(selectedDate, 0), 18);

  const bookedTimes = mesaScheduleOnDay.map((reservation) => ({
    start: parseISO(reservation.data + ' ' + reservation.horaInicio),
    end: parseISO(reservation.data + ' ' + reservation.horaFim),
  }));

  // Encontra o próximo agendamento após o horário de início selecionado
  const nextBookingStart = bookedTimes.find((time) =>
    isAfter(time.start, horarioInicioAgendamento)
  );

  // Define o horário final de disponibilidade com base no próximo agendamento ou no horário de fechamento
  const lastAvailableEndTime = nextBookingStart
    ? nextBookingStart.start
    : endTime;

  let timesEnd = [];
  let currentTimeEnd = addMinutes(horarioInicioAgendamento, incrementInMinutes);

  while (isBefore(currentTimeEnd, lastAvailableEndTime)) {
    timesEnd.push(currentTimeEnd);
    currentTimeEnd = addMinutes(currentTimeEnd, incrementInMinutes);
  }

  const newAvailableEndTimes = timesEnd.map((time) => format(time, 'HH:mm'));

  setAvailableEndTimes(newAvailableEndTimes);
}, [horarioInicioAgendamento, mesaScheduleOnDay]);

  return (
    <div className="flex flex-col h-full w-full justify-center items-center">
      <button className="h-6 w-6 self-start m-8" onClick={handleBack}>
        <FaArrowLeft className="h-6 w-6 text-white" />
      </button>
      <div className="flex flex-col justify-center h-max w-[900px] bg-white rounded-xl">
        <div className="flex flex-col items-center mt-5 mb-10">
          <h1 className="text-orange-500 text-xl font-extrabold">
            Agendar Horário
          </h1>
        </div>
        <div className="flex flex-row justify-between px-8 pb-12">
          <div className="flex flex-col">
            <DatePicker
              formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 3)}
              selected={selectedDate}
              onChange={handleDateChange}
              inline
              minDate={new Date()}
            />

            <div className="flex flex-row justify-between mt-2 px-2">
              {user && user.acesso === "aluno" ? (
                <>
                  <button
                    className={buttonStyle}
                    onClick={() => {
                      handleTypeChange("mesa");
                    }}
                  >
                    Mesa
                  </button>
                  <button className={disableButtonStyle} disabled>
                    Máquina
                  </button>
                  <button className={disableButtonStyle} disabled>
                    Laboratório
                  </button>
                </>
              ) : (
                <></>
              )}

              {user && user.acesso === "monitor" ? (
                <>
                  <button
                    className={buttonStyle}
                    onClick={() => {
                      handleTypeChange("mesa");
                    }}
                  >
                    Mesa
                  </button>
                  <button
                    className={buttonStyle}
                    onClick={() => {
                      handleTypeChange("maquina");
                    }}
                  >
                    Máquina
                  </button>
                  <button className={disableButtonStyle} disabled>
                    Laboratório
                  </button>
                </>
              ) : (
                <></>
              )}

              {user && user.acesso === "professor" ? (
                <>
                  <button
                    className={buttonStyle}
                    onClick={() => {
                      handleTypeChange("mesa");
                    }}
                  >
                    Mesa
                  </button>
                  <button
                    className={buttonStyle}
                    onClick={() => {
                      handleTypeChange("maquina");
                    }}
                  >
                    Máquina
                  </button>
                  <button
                    className={buttonStyle}
                    onClick={() => {
                      handleTypeChange("laboratorio");
                    }}
                  >
                    Laboratório
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="flex flex-row">
            <div className="flex flex-col items-center border-[1px] overflow-auto border-[#aeaeae] rounded-l-md w-[150px] h-[267px]">
              {availableStartTimes.map((time, index) => (
                <button
                  key={index}
                  className="flex p-3 border-b text-black text-xs border-[#aeaeae] w-full text-center hover:bg-[#f5f5f5]"
                  onClick={() => {
                    setHorarioInicioAgendamento(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        parseInt(time.split(":")[0]),
                        parseInt(time.split(":")[1])
                      )
                    );
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
            <div className="flex flex-col items-center border-[1px] overflow-auto border-[#aeaeae] rounded-r-md w-[150px] h-[267px]">
              {availableEndTimes.map((time, index) => (
                <button
                  key={index}
                  className="flex p-3 border-b text-black text-xs border-[#aeaeae] w-full text-center hover:bg-[#f5f5f5]"
                  onClick={() => {
                    setHorarioFimAgendamento(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        parseInt(time.split(":")[0]),
                        parseInt(time.split(":")[1])
                      )
                    );
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
