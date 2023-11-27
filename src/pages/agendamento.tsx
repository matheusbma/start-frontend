import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SetStateAction, useState } from "react";
import axios from "axios";
import { format, set } from "date-fns";

export default function Agendamento() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleOnDay, setScheduleOnDay] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    const formattedDate = format(date, "dd-MM-yyyy");
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
      setScheduleOnDay(response);
      const times = response.map(
        (event: { horaInicio: string }) => event.horaInicio
      );
      setAvailableTimes(times);
      console.log("Horários disponíveis:", times);
    } catch (error) {
      console.error("Erro ao buscar os horários:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full justify-center items-center">
      <div className="flex flex-col justify-center mt-24 h-max w-[900px] bg-white rounded-xl">
        <div className="flex flex-col items-center mt-5 mb-10">
          <h1 className="text-orange-500 text-xl font-extrabold">
            Agendar Horário
          </h1>
        </div>

        <div className="flex ml-8">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          inline // Esta propriedade mantém o calendário sempre visível
        />

        </div>
        <div>
          Horários disponíveis:
          <ul>
            {availableTimes.map((time) => (
              <li key={time}>{time}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
