import { useSession, signIn, signOut } from "next-auth/react";
import router from "next/router";
import { useEffect } from "react";

import Header from "../components/Header";

export default function Calendar() {
  const { data: session, status } = useSession();
  const userImg = session?.user?.image;
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  function handleSignOut() {
    signOut();
  }

  return (
    <div>
      <Header userImg={userImg ?? ''} userName={userName ?? ''} />
      <div className="flex min-h-screen flex-col items-center mt-8 p-0">
        <h1 className="text-[9rem] font-bold">Calendar</h1>
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
