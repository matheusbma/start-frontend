import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const events = [
    {
      title: "Lab 01",
      start: moment().toDate(),
      end: moment().add(1, "hours").toDate(),
    },
    {
      title: "Lab 02",
      start: moment().toDate(),
      end: moment().add(1, "hours").toDate(),
    },
    // ...mais eventos
  ];

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

export default MyCalendar;
