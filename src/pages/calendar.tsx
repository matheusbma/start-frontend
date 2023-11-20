import axios from 'axios';
import router from "next/router";
import { use, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

import Header from "../components/Header";
import MyCalendar from "../components/Calendar";

export default function Calendar() {
  const { data: session, status } = useSession();
  const userImg = session?.user?.image;
  const userName = session?.user?.name?.split(" ")[0];
  const userEmail = session?.user?.email;

  const [user, setUser] = useState({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  function handleSignOut() {
    signOut();
  }

  useEffect(() => {
    axios.get('http://localhost:8080/' + 'usuarios')
    .then((response) => {
      const filteredUser = response.data.filter((user: { email: string | null | undefined; }) => user.email === userEmail)
      setUser(filteredUser[0])
      console.log(filteredUser[0])
    })
    .catch((error) => {
      console.log(error);
    })
  }
  ,[])

  




  return (
    <div>
      <Header userImg={userImg ?? ''} userName={userName ?? ''} />
      <div className="flex min-h-screen flex-col items-center mt-8 p-0">
        <MyCalendar/>
        <button
          className="flex items-center mt-10 mb-32 text-orange-600 p-6 bg-white rounded-3xl h-10"
          onClick={handleSignOut}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
