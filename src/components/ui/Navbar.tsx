"use client";
import Link from "next/link";
import React, { useState } from "react";
import useAuthModal from "../../../hooks/useAuthModal";
import Button from "../Button";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "../../../hooks/useUser";
import { toast } from "react-hot-toast";
import { FaUserAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

function isScreenSizeGreaterThan1000() {
  return window.innerWidth > 1000;
}

const Navbar = () => {
  const { user } = useUser();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const authModal = useAuthModal();
  const supabaseClient = useSupabaseClient();

  const findUser = async () => {
    try {
      setLoading(true);

      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, role")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setUsername(data.username || null);
          setRole(data.role || null);
        }
      } else {
        // Throw an error if the user object is not available.
        throw new Error("User information is not available.");
      }
    } catch (error) {
      console.error("Error finding user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    findUser();
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    //player.reset();
    router.refresh();
    router.push("/");
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="sticky inset-x-0 top-0 bg-white dark:bg-gray-950 z-[20] h-fit border-b border-zinc-300">
      <div className="flex items-center justify-between py-2 px-8 mx-auto max-w-7xl">
        <button
          onClick={() => router.push("/")}
          className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white"
        >
          Med_quiz
        </button>

        {user ? (
          <div className="flex gap-x-4 items-center">
            {role === 'admin' ? (
              <Button
                onClick={() => router.push("/appointmentList")}
                className="bg-white rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white"
              >
                Lista_Wizyt
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/appointment")}
                className="bg-white rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white"
              >
                Umów_Wizytę
              </Button>
            )}
            {isScreenSizeGreaterThan1000() && (
              <div className="email">
                {loading ? "Loading..." : username || user.email}
              </div>
            )}

            <Button
              onClick={() => router.push("/account")}
              className="bg-white"
            >
              <FaUserAlt />
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-white rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white"
            >
              Wyloguj
            </Button>
          </div>
        ) : (
          <button
            onClick={authModal.onOpen}
            className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white ml-4"
          >
            Zaloguj
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
