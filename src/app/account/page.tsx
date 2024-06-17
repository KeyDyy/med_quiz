"use client";
import { useState, useEffect } from "react";
import { useUserAuth } from "@/lib/userAuth";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/../hooks/useUser";
import Button from "@/components/Button";

function UsernameCheck() {
  const [username, setUsername] = useState("");
  const [isUsernameMissing, setIsUsernameMissing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    checkUsername();
  }, [user]);

  async function checkUsername() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      if (!data || !data.length || !data[0].username) {
        setIsUsernameMissing(true);
        setShowModal(true);
      } else {
        setUsername(data[0].username);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
  }

  const handleAddUsername = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ username })
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      setIsUsernameMissing(false);
      setShowModal(false);
      checkUsername();
    } catch (error) {
      console.error("Error adding username:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-100 p-12 rounded-2xl">
            <p className="font-bold text-xl">Proszę dodaj swój nick:</p>
            <input
              type="text"
              placeholder="Wpisz tutaj"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-4 mb-1 p-2 border rounded flex border-gray-400 focus:border-black"
              style={{
                outline: "none",
                boxShadow: "0 0 3px rgba(0, 0, 0, 0.5)",
              }}
            />
            <Button
              onClick={handleAddUsername}
              className="mt-4 bg-black text-white p-2 rounded"
            >
              Dodaj nick
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CompletedTest {
  id: number;
  user_id: string;
  test_type: string;
  illness: string | null;
  depression_score: number | null;
  user_answers: Record<string, any>;
  created_at: string;
}

function CompletedTestsList() {
  const { user } = useUser();
  const [completedTests, setCompletedTests] = useState<CompletedTest[]>([]);
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchCompletedTests();
    }
  }, [user]);

  async function fetchCompletedTests() {
    try {
      const { data, error } = await supabase
        .from("completed_tests")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });


      if (error) {
        throw error;
      }

      setCompletedTests(data);
    } catch (error) {
      console.error("Error fetching completed tests:", error);
    }
  }

  const toggleExpand = (testId: number) => {
    setExpandedTestId(expandedTestId === testId ? null : testId);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Twoje zakończone testy</h2>
      {completedTests.map((test) => (
        <div
          key={test.id}
          className="mb-4 p-4 border rounded-lg bg-white shadow-sm"
          onClick={() => toggleExpand(test.id)}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">
                Typ testu: {test.test_type}
              </p>
              <p>
                {test.test_type === "depresja"
                  ? `Wynik: ${test.depression_score}`
                  : `Choroba: ${test.illness}`}
              </p>
              <p>Data: {new Date(test.created_at).toLocaleString()}</p>
            </div>
            <button
              className="text-blue-500"
              onClick={() => toggleExpand(test.id)}
            >
              {expandedTestId === test.id ? "Ukryj" : "Pokaż więcej"}
            </button>
          </div>
          {expandedTestId === test.id && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Odpowiedzi:</h3>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(test.user_answers, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  useUserAuth();
  const { user } = useUser();

  return (
    <div>
      <UsernameCheck />
      {user && <CompletedTestsList />}
    </div>
  );
}
