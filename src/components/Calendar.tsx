import React, { use, useEffect, useState } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  formatMesaEvent,
  formatMaquinaELaboratorioEvent,
} from "@/utils/convert";
import axios from "axios";
const localizer = momentLocalizer(moment);

interface CalendarProps {
  eventsList: {
    id: number;
    id_usuario: number;
    id_reserva: number;
    data: string;
    horaInicio: string;
    horaFim: string;
    reserva: string;
  }[];
}

interface Event {
  id: any;
  title: string;
  start: Date;
  end: Date;
}

export default function UserCalendar({ eventsList }: CalendarProps) {
  const [formattedEvents, setFormattedEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function processEvents() {
      const promises = eventsList.map(async (event) => {
        if (event.reserva === "mesa") {
          try {
            const response = await axios.get(`http://localhost:8080/mesa/${event.id_reserva}`);
            const lab = response.data.id_laboratorio;
            return formatMesaEvent(event, lab);
          } catch (error) {
            console.error("Error fetching labId: ", error);
          }
        } else {
          return formatMaquinaELaboratorioEvent(event);
        } 
      });

      const events = await Promise.all(promises);
      setFormattedEvents(events);
    }

    processEvents();
  }, [eventsList]);


  return (
    <div>
      <Calendar
        className="text-black bg-white rounded-xl p-4"
        localizer={localizer}
        events={formattedEvents.filter((event) => event !== null)}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 550 }}
      />
    </div>
  );
}
