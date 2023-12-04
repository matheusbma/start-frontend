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
  isWithinInterval,
  parseISO,
  set,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns";
import { useRouter } from "next/router";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";
import moment from "moment";

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

interface AvailabilityProps {
  available: boolean;
  type: "mesa" | "maquina" | "laboratorio";
}

const buttonStyle =
  "flex justify-center items-center font-light text-xs text-white bg-orange-500 rounded-md h-8 w-24";
const disableButtonStyle =
  "flex justify-center items-center font-light text-xs text-white bg-zinc-400 rounded-md h-8 w-24";

const incrementInMinutes: number = 60;
const openingTime: Date = setHours(setMinutes(setSeconds(new Date(), 0), 0), 8);
const endTime: Date = setHours(setMinutes(setSeconds(new Date(), 0), 0), 9);
const closingTime: Date = setHours(
  setMinutes(setSeconds(new Date(), 0), 0),
  18
);

export default function Agendamento() {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProps | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<
    "mesa" | "maquina" | "laboratorio"
  >("mesa");

  const [startScheduleTime, setStartScheduleTime] = useState<Date>();
  const [endScheduleTime, setEndScheduleTime] = useState<Date>();

  const [mesaScheduleOnDayLab1, setMesaScheduleOnDayLab1] = useState<
    EventProps[]
  >([]);
  const [mesaScheduleOnDayLab2, setMesaScheduleOnDayLab2] = useState<
    EventProps[]
  >([]);
  const [maquinaScheduleOnDayMaquina1, setMaquinaScheduleOnDayMaquina1] =
    useState<EventProps[]>([]);
  const [maquinaScheduleOnDayMaquina2, setMaquinaScheduleOnDayMaquina2] =
    useState<EventProps[]>([]);
  const [maquinaScheduleOnDayMaquina3, setMaquinaScheduleOnDayMaquina3] =
    useState<EventProps[]>([]);
  const [labScheduleOnDayLab1, setLabScheduleOnDayLab1] = useState<
    EventProps[]
  >([]);
  const [labScheduleOnDayLab2, setLabScheduleOnDayLab2] = useState<
    EventProps[]
  >([]);

  const [labMesaNumber, setLabMesaNumber] = useState<number>(1);
  const [maquinaNumber, setMaquinaNumber] = useState<number>(1);
  const [labNumber, setLabNumber] = useState<number>(1);

  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");

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

  const handleCriarAgendamento = async () => {
    const formattedDate = selectedDate.toISOString().substr(0, 10);
    const formattedStartTime = moment(startScheduleTime).format('HH:mm:ss');
    const formattedEndTime = moment(endScheduleTime).format('HH:mm:ss');

    if (!startScheduleTime || !endScheduleTime) {
      alert("Selecione um horário de início e um horário de término");
      return;
    }

    console.log({
      idUsuario: user?.id,
      idReserva: 1,
      data: formattedDate,
      horaInicio: formattedStartTime,
      horaFim: formattedEndTime,
      reserva: selectedType,
    })

    const response = await axios
      .post("http://localhost:8080/" + "agendamentos", {
        idUsuario: user?.id,
        idReserva: 1,
        data: formattedDate,
        horaInicio: formattedStartTime,
        horaFim: formattedEndTime,
        reserva: selectedType,
      })
      .then((response) => {
        alert(`Agendamento criado com sucesso! \nAgentamento: ${selectedType} 1\nData: ${formattedDate}\nHorário de início: ${formattedStartTime}\nHorário de término: ${formattedEndTime}`);
        router.push("/home");
      })
      .catch((error) => {
        console.error("Erro ao criar o agendamento:", error);
      });
  };

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
          const mesaLab1EventsOnDate = mesaEventsOnDate.filter(
            (event: { idReserva: number }) =>
              event.idReserva >= 1 && event.idReserva <= 16
          );
          const mesaLab2EventsOnDate = mesaEventsOnDate.filter(
            (event: { idReserva: number }) =>
              event.idReserva >= 17 && event.idReserva <= 30
          );
          const maquinaMaquina1EventsOnDate = maquinaEventsOnDate.filter(
            (event: { idReserva: number }) => event.idReserva === 1
          );
          const maquinaMaquina2EventsOnDate = maquinaEventsOnDate.filter(
            (event: { idReserva: number }) => event.idReserva === 2
          );
          const maquinaMaquina3EventsOnDate = maquinaEventsOnDate.filter(
            (event: { idReserva: number }) => event.idReserva === 3
          );
          const labLab1EventsOnDate = labEventsOnDate.filter(
            (event: { idReserva: number }) => event.idReserva === 1
          );
          const labLab2EventsOnDate = labEventsOnDate.filter(
            (event: { idReserva: number }) => event.idReserva === 2
          );
          return {
            mesa: {
              lab1: mesaLab1EventsOnDate,
              lab2: mesaLab2EventsOnDate,
            },
            maquina: {
              maquina1: maquinaMaquina1EventsOnDate,
              maquina2: maquinaMaquina2EventsOnDate,
              maquina3: maquinaMaquina3EventsOnDate,
            },
            lab: {
              lab1: labLab1EventsOnDate,
              lab2: labLab2EventsOnDate,
            },
          };
        }
      );
      setMesaScheduleOnDayLab1(response.mesa.lab1);
      setMesaScheduleOnDayLab2(response.mesa.lab2);
      setMaquinaScheduleOnDayMaquina1(response.maquina.maquina1);
      setMaquinaScheduleOnDayMaquina2(response.maquina.maquina2);
      setMaquinaScheduleOnDayMaquina3(response.maquina.maquina3);
      setLabScheduleOnDayLab1(response.lab.lab1);
      setLabScheduleOnDayLab2(response.lab.lab2);
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

  function generateStartTimeSlots(
    startTime: Date,
    endTime: Date,
    increment: number
  ) {
    let times = [];
    let currentTime = new Date(startTime.getTime());

    while (isBefore(currentTime, endTime)) {
      times.push(new Date(currentTime.getTime()));
      currentTime = addMinutes(currentTime, increment);
    }

    return times;
  }

  function generateEndTimeSlots(
    startTime: Date,
    endTime: Date,
    increment: number,
    selectedDate: Date
  ) {
    let times = [];
    let currentTime = new Date(startTime.getTime());
    let newCurrentTime = addMinutes(currentTime, increment);
    let newEndTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      endTime.getHours(),
      endTime.getMinutes(),
      endTime.getSeconds()
    );

    while (
      isBefore(newCurrentTime, newEndTime) ||
      isEqual(newCurrentTime, newEndTime)
    ) {
      times.push(new Date(newCurrentTime.getTime()));
      newCurrentTime = addMinutes(newCurrentTime, increment);
    }

    return times;
  }

  function changeDate(selectedDate: Date, time: Date[]) {
    return time.map((time) => {
      return set(selectedDate, {
        hours: time.getHours(),
        minutes: time.getMinutes(),
        seconds: 0,
      });
    });
  }

  useEffect(() => {
    const updateAvailableTimes = (schedules: any[]) => {
      let startTimes = generateStartTimeSlots(
        openingTime,
        closingTime,
        incrementInMinutes
      );
      let endTimes = generateEndTimeSlots(
        startScheduleTime ? startScheduleTime : openingTime,
        closingTime,
        incrementInMinutes,
        selectedDate
      );

      let newStartTimes = changeDate(selectedDate, startTimes);
      let newEndTimes = changeDate(selectedDate, endTimes);
      let newSelectedStartTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startScheduleTime ? startScheduleTime.getHours() : openingTime.getHours(),
        startScheduleTime ? startScheduleTime.getMinutes() : openingTime.getMinutes(),
        startScheduleTime ? startScheduleTime.getSeconds() : openingTime.getSeconds()
      );

      // Filtrar os horários ocupados dos horários iniciais disponíveis
      schedules.forEach((schedule) => {
        const startTime = parseISO(schedule.data + "T" + schedule.horaInicio);
        const endTime = parseISO(schedule.data + "T" + schedule.horaFim);
        newStartTimes = newStartTimes.filter((slotStartTime) => {
          return isBefore(slotStartTime, startTime) || !isEqual(slotStartTime, startTime);
        });
        newEndTimes = newEndTimes.filter((slotEndTime) => {
          if (isBefore(slotEndTime, startTime)) {
            return true; // Permite hor de término antes do agendamento
          }
          if (isAfter(slotEndTime, endTime)) {
            // Permite horários de término após o agendamento somente se o horário de início selecionado é após ou igual ao fim do agendamento atual
            return newSelectedStartTime ? isAfter(new Date(newSelectedStartTime), endTime) || isEqual(new Date(newSelectedStartTime), endTime) : false;
          }
          return false; // Para todos os outros casos, não permite o horário de término
        });
      });

      setAvailableStartTimes(
        newStartTimes.map((time) => format(time, "HH:mm"))
      );
      setAvailableEndTimes(newEndTimes.map((time) => format(time, "HH:mm")));
    };

    if (selectedType == "mesa") {
      if (labMesaNumber == 1) {
        updateAvailableTimes(mesaScheduleOnDayLab1);
      }
      if (labMesaNumber == 2) {
        updateAvailableTimes(mesaScheduleOnDayLab2);
      }
    }

    if (selectedType == "maquina") {
      if (maquinaNumber == 1) {
        updateAvailableTimes(maquinaScheduleOnDayMaquina1);
      }
      if (maquinaNumber == 2) {
        updateAvailableTimes(maquinaScheduleOnDayMaquina2);
      }
      if (maquinaNumber == 3) {
        updateAvailableTimes(maquinaScheduleOnDayMaquina3);
      }
    }

    if (selectedType == "laboratorio") {
      if (labNumber == 1) {
        updateAvailableTimes(labScheduleOnDayLab1);
      }
      if (labNumber == 2) {
        updateAvailableTimes(labScheduleOnDayLab2);
      }
    }
  }, [
    selectedType,
    selectedDate,
    labMesaNumber,
    maquinaNumber,
    labNumber,
    mesaScheduleOnDayLab1,
    mesaScheduleOnDayLab2,
    maquinaScheduleOnDayMaquina1,
    maquinaScheduleOnDayMaquina2,
    maquinaScheduleOnDayMaquina3,
    labScheduleOnDayLab1,
    labScheduleOnDayLab2,
    startScheduleTime,
  ]);

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
                    className={buttonStyle + `${selectedType !== "mesa" ? ` bg-white !text-black border-[1px] border-rgb(174 174 174)` : ``}`}
                    onClick={() => {
                      handleTypeChange("mesa");
                    }}
                  >
                    Mesa
                  </button>
                  <button
                    className={buttonStyle + `${selectedType !== "maquina" ? ` bg-white !text-black border-[1px] border-rgb(174 174 174)` : ``}`}
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
                    className={buttonStyle + `${selectedType !== "mesa" ? ` bg-white !text-black border-[1px] border-rgb(174 174 174)` : ``}`}
                    onClick={() => {
                      handleTypeChange("mesa");
                    }}
                  >
                    Mesa
                  </button>
                  <button
                    className={buttonStyle + `${selectedType !== "maquina" ? ` bg-white !text-black border-[1px] border-rgb(174 174 174)` : ``}`}
                    onClick={() => {
                      handleTypeChange("maquina");
                    }}
                  >
                    Máquina
                  </button>
                  <button
                    className={buttonStyle + `${selectedType !== "laboratorio" ? ` bg-white !text-black border-[1px] border-rgb(174 174 174)` : ``}`}
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

          <div className="flex flex-col mt-6">
            {selectedType === "mesa" ? (
              <>
                <button
                  onClick={() => {
                    setLabMesaNumber(1);
                  }}
                  className={
                    buttonStyle +
                    " mb-3" +
                    `${
                      labMesaNumber === 2
                        ? " bg-white !text-black border-[1px] border-rgb(174 174 174)"
                        : ""
                    }`
                  }
                >
                  Laboratório 1
                </button>
                <button
                  onClick={() => {
                    setLabMesaNumber(2);
                  }}
                  className={
                    buttonStyle +
                    `${
                      labMesaNumber === 1
                        ? " bg-white !text-black border-[1px] border-rgb(174 174 174)"
                        : ""
                    }`
                  }
                >
                  Laboratório 2
                </button>
              </>
            ) : (
              <></>
            )}
            {selectedType === "maquina" ? (
              <>
                <button
                  onClick={() => {
                    setMaquinaNumber(1);
                  }}
                  className={
                    buttonStyle +
                    " mb-3" +
                    `${
                      maquinaNumber === 2 || maquinaNumber === 3
                        ? " bg-white !text-black border-[1px] border-rgb(174 174 174)"
                        : ""
                    }`
                  }
                >
                  Máquina 1
                </button>
                <button
                  onClick={() => {
                    setMaquinaNumber(2);
                  }}
                  className={
                    buttonStyle +
                    " mb-3" +
                    `${
                      maquinaNumber === 1 || maquinaNumber === 3
                        ? " bg-white !text-black border-[1px] border-rgb(174 174 174)"
                        : ""
                    }`
                  }
                >
                  Máquina 2
                </button>
                <button
                  onClick={() => {
                    setMaquinaNumber(3);
                  }}
                  className={
                    buttonStyle +
                    `${
                      maquinaNumber === 1 || maquinaNumber === 2
                        ? " bg-white !text-black border-[1px] border-rgb(174 174 174)"
                        : ""
                    }`
                  }
                >
                  Máquina 3
                </button>
              </>
            ) : (
              <></>
            )}
            {selectedType === "laboratorio" ? (
              <>
                <button
                  onClick={() => {
                    setLabNumber(1);
                  }}
                  className={
                    buttonStyle +
                    " mb-3" +
                    `${
                      labNumber === 2
                        ? " bg-white !text-black border-[1px] border-rgb(174 174 174)"
                        : ""
                    }`
                  }
                >
                  Laboratório 1
                </button>
                <button
                  onClick={() => {
                    setLabNumber(2);
                  }}
                  className={
                    buttonStyle +
                    `${
                      labNumber === 1
                        ? " bg-white !text-black border-[1px] border-rgb(174 174 174)"
                        : ""
                    }`
                  }
                >
                  Laboratório 2
                </button>
              </>
            ) : (
              <></>
            )}
          </div>

          <div className="flex flex-col items-end">
            <div className="flex flex-row">
              <div className="flex flex-col items-center border-[1px] overflow-auto border-[#aeaeae] rounded-l-md w-[150px] h-[267px]">
                {availableStartTimes.map((time, index) => (
                  <button
                    key={index}
                    className={`flex p-3 border-b text-black text-xs border-[#aeaeae] w-full text-center hover:bg-orange-500 ${
                      time === selectedStartTime
                        ? "bg-orange-500 text-white"
                        : ""
                    }`}
                    onClick={() => {
                      const newStartTime = new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        parseInt(time.split(":")[0]),
                        parseInt(time.split(":")[1])
                      );
                      setStartScheduleTime(newStartTime);
                      setSelectedStartTime(format(newStartTime, "HH:mm"));
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
                    className={`flex p-3 border-b text-black text-xs border-[#aeaeae] w-full text-center hover:bg-orange-500 ${
                      time === selectedEndTime ? "bg-orange-500 text-white" : ""
                    }`}
                    onClick={() => {
                      const newEndTime = new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        parseInt(time.split(":")[0]),
                        parseInt(time.split(":")[1])
                      );
                      setEndScheduleTime(newEndTime);
                      setSelectedEndTime(format(newEndTime, "HH:mm"));
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCriarAgendamento}
              className="flex justify-center items-center font-light text-xs text-white bg-orange-500 rounded-md h-8 w-32 mt-4 mr-2"
            >
              Criar Agendamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
