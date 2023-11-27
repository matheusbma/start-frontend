import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import axios from "axios";

interface EventProps {
  title: string;
  id: number;
  idUsuario: number;
  idReserva: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  reserva: string;
}

interface DateTimeDialogProps {
  open: boolean;
  onClose: () => void;
  event?: EventProps;
}

export default function DateTimeDialog({
  open,
  onClose,
  event,
}: DateTimeDialogProps) {
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (event) {
      const formattedDate = (event.data || "").split("/").reverse().join("-");
      setDay(formattedDate);
      setStartTime(event.horaInicio);
      setEndTime(event.horaFim);
    }
  }, [event]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    axios
      .put("http://localhost:8080/" + "agendamentos/" + event?.id, {
        idUsuario: event?.idUsuario,
        idReserva: event?.idReserva,
        data: day,
        horaInicio: startTime,
        horaFim: endTime,
        reserva: event?.reserva,
      })
      .then(() => {
        console.log("Agendamento atualizado com sucesso!");
      })
      .catch((error) => {
        console.log(error);
      });
    onClose();
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Definir um novo Horário</DialogTitle>
        <DialogContent>
          <DialogContentText>{event?.title}:</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="day"
            label="Dia"
            type="date"
            fullWidth
            variant="standard"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
          <TextField
            margin="dense"
            id="start-time"
            label="Hora de Início"
            type="time"
            fullWidth
            variant="standard"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <TextField
            margin="dense"
            id="end-time"
            label="Hora de Fim"
            type="time"
            fullWidth
            variant="standard"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
