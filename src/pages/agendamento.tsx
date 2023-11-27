import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import router from "next/router";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

const buttonStyle =
  "flex justify-center items-center font-light text-xs text-white bg-orange-500 rounded-md h-8 w-28";
const disableButtonStyle =
  "flex justify-center items-center font-light text-xs text-white bg-zinc-400 rounded-md h-8 w-28";

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

export default function Agendamento() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProps>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleOnDay, setScheduleOnDay] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedType, setSelectedType] = useState("mesa");

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
          const eventsOnDate = events.filter(
            (event: { data: string }) => event.data === formattedDate
          );
          return eventsOnDate;
        }
      );
      console.log("Agendamentos do dia:", response);
      setScheduleOnDay(response);
    } catch (error) {
      console.error("Erro ao buscar os horários:", error);
    }
  };

  function handleTypeChange(type: string) {
    // const

    setSelectedType(type);
  }

  function handleBack() {
    router.back();
  }

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

        <div className="flex flex-col ml-8 mb-12">
          <DatePicker
            formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 3)}
            selected={selectedDate}
            onChange={handleDateChange}
            inline
          />

          <div className="flex flex-row justify-between w-[350px] mt-2 ">
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
              <div></div>
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
              <div></div>
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
              <div></div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
