import React, { useEffect, useState } from "react";
import moment from "moment";
import { ptBR } from "date-fns/locale";

import {
  Calendar,
  dateFnsLocalizer,
  momentLocalizer,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  formatMesaEvent,
  formatMaquinaELaboratorioEvent,
} from "@/utils/convert";
import axios from "axios";
import { format, getDay, parse, startOfWeek } from "date-fns";

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarProps {
  eventsList: {
    id: number;
    idUsuario: number;
    idReserva: number;
    data: string;
    horaInicio: string;
    horaFim: string;
    reserva: string;
  }[];
}

interface formattedEventProps {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

export default function UserCalendar({ eventsList }: CalendarProps) {
  const [formattedEvents, setFormattedEvents] = useState<formattedEventProps[]>(
    []
  );

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
              return formatMesaEvent(event, lab);
            } catch (error) {
              console.error("Error fetching labId: ", error);
            }
          } else {
            return formatMaquinaELaboratorioEvent(event);
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

  const pastDayStyleGetter = (date: moment.MomentInput) => {
    if (moment().isAfter(date, "day")) {
      return {
        style: {
          backgroundColor: "#e9e9e9",
          pointerEvents: "none",
          color: "#d1d1d1",
        },
      };
    }
    return {};
  };

  return (
    <div>
      <Calendar
        className="text-black bg-white rounded-xl p-4"
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 550, fontSize: 10 }}
        dayPropGetter={pastDayStyleGetter as any}
        culture="pt-BR"
      />
    </div>
  );
}
