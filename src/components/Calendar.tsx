import React, { use, useEffect } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

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

export default function UserCalendar( { eventsList }: CalendarProps) {

  useEffect(() => {
    if (eventsList) {
      console.log(eventsList);
    }
  }, [eventsList]);
  
 function formatEvents() {
    const events = eventsList.map((event) => {
      const date = moment(event.data).format("YYYY-MM-DD");
      const start = moment(date + " " + event.horaInicio).toDate();
      const end = moment(date + " " + event.horaFim).toDate();
      const title = event.reserva + " " + event.id;
      return {
        id: event.id,
        title: title,
        start: start,
        end: end,
      };
    });
    return events;
  }

  const events = formatEvents();

  return (
    <div>
      <Calendar
        className="text-black bg-white rounded-xl p-4"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 550, }}
      />
    </div>
  );
};

