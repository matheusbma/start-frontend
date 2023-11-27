import moment from "moment";

export function convertToCamelCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(" ");
}

export function formatMesaEvent(event: any, lab: any) {
  const date = moment(event.data).format("YYYY-MM-DD");
  const start = moment(date + " " + event.horaInicio).toDate();
  const end = moment(date + " " + event.horaFim).toDate();
  const title =
    convertToCamelCase(event.reserva) +
    " " +
    event.id_reserva +
    " - Laboratório " +
    lab;
  return {
    id: event.id,
    title: title,
    start: start,
    end: end,
  };
}

export function formatMaquinaELaboratorioEvent(event: any) {
  const date = moment(event.data).format("YYYY-MM-DD");
  const start = moment(date + " " + event.horaInicio).toDate();
  const end = moment(date + " " + event.horaFim).toDate();
  const title = convertToCamelCase(event.reserva) + " " + event.id_reserva;
  return {
    id: event.id,
    title: title,
    start: start,
    end: end,
  };
}

export function formatData(data: string) {
  const date = moment(data).format("DD/MM/YYYY");
  return date;
}