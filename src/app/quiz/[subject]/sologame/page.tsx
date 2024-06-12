"use client";
import { useState } from "react";
import { NextPage } from "next";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DecisionTreeNode {
  question: string;
  options: { [key: string]: DecisionTreeNode | string };
}

const decisionTree: DecisionTreeNode = {
  question: "lęk",
  options: {
    T: {
      question: "nastrój obniżony",
      options: {
        T: {
          question: "nasilony smutek, przygnębienie",
          options: {
            T: {
              question: "raz smutek, przygnębienie…",
              options: {
                T: "Epizod depresji",
                N: "Depresja",
              },
            },
            N: "Inne zaburzenia lękowe",
          },
        },
        N: {
          question: "nasilony lęk i brak poczucia bezpieczeństwa",
          options: {
            T: {
              question: "lęk przed przebywaniem na otwartej przestrzeni, np. kościół, sklep, tłum",
              options: {
                T: "Agorafobia",
                N: {
                  question: "lęk przed wystąpieniem publicznym, kompromitacją",
                  options: {
                    T: "Fobia społeczna",
                    N: {
                      question: "lęk przed przytyciem",
                      options: {
                        T: {
                          question: "głodzenie się i intensywne ćwiczenia",
                          options: {
                            T: "Anoreksja",
                            N: {
                              question: "objadanie się i prowokowanie wymiotów",
                              options: {
                                T: "Bulimia",
                                N: "Inne zaburzenia psychiczne",
                              },
                            },
                          },
                        },
                        N: "Inne zaburzenia lękowe",
                      },
                    },
                  },
                },
              },
            },
            N: "Inne zaburzenia lękowe",
          },
        },
      },
    },
    N: {
      question: "euforia, radość",
      options: {
        T: {
          question: "smutek, przygnębienie",
          options: {
            T: "Zespół maniakalny",
            N: "Zaburzenia schizoafektywne",
          },
        },
        N: {
          question: "agresja",
          options: {
            T: {
              question: "omamy, urojenia",
              options: {
                T: "Schizofrenia paranoidalna",
                N: "Nadmierna agresja",
              },
            },
            N: {
              question: "sztywność mięśniowa",
              options: {
                T: {
                  question: "osłupienie",
                  options: {
                    T: "Schizofrenia katatoniczna",
                    N: "Inne zaburzenia psychiczne",
                  },
                },
                N: {
                  question: "ograniczona aktywność",
                  options: {
                    T: {
                      question: "ilość treści wypowiedzi",
                      options: {
                        T: "Schizofrenia rezydualna",
                        N: {
                          question: "izolacja od otoczenia",
                          options: {
                            T: "Inne zaburzenia psychiczne",
                            N: {
                              question: "wycofanie społeczne",
                              options: {
                                T: "Schizofrenia prosta",
                                N: "Inne zaburzenia psychiczne",
                              },
                            },
                          },
                        },
                      },
                    },
                    N: "Zdrowy",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};


const QuizPage: NextPage = () => {
  const [currentNode, setCurrentNode] = useState<DecisionTreeNode>(decisionTree);
  const [currentDecisionPath, setCurrentDecisionPath] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<string>("");

  const router = useRouter();

  const handleSelectAnswer = (selectedAnswer: string) => {
    if (typeof currentNode.options[selectedAnswer] === "string") {
      setResult(currentNode.options[selectedAnswer] as string);
      setQuizCompleted(true);
    } else {
      const nextNode = currentNode.options[selectedAnswer] as DecisionTreeNode;
      setCurrentNode(nextNode);
      setCurrentDecisionPath([...currentDecisionPath, currentNode.question]);
    }
  };

  const handlePlayAgain = () => {
    setCurrentNode(decisionTree);
    setCurrentDecisionPath([]);
    setQuizCompleted(false);
    setResult("");
  };

  const renderQuestion = () => (
    <div className="flex justify-center pb-12">
      <div className="flex flex-col mt-16 m-6 h-max bg-gray-200 p-12 border-2 border-gray-600 rounded-2xl shadow-2xl">
        <div className="center-content font-sans text-center">
          <div className="text-2xl font-bold mb-6 flex justify-center">
            {currentNode.question}
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {Object.keys(currentNode.options).map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelectAnswer(option)}
                className="bg-white m-2 rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white"
                style={{ cursor: "pointer" }}
              >
                <strong>{option === "T" ? "Tak" : "Nie"}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-bold">Aktualna gałąź drzewa decyzyjnego:</h3>
          <p>{currentDecisionPath.join(" -> ")}</p>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="flex justify-center mt-6">
      <Card className="flex flex-col mt-12 m-6 h-max lg:p-8 p-4 rounded-2xl border shadow-2xl border-gray-400">
        <CardHeader>
          <CardTitle>Quiz ukończony</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-black">Wynik: {result}</CardDescription>
          <CardDescription className="text-black">Ścieżka: {currentDecisionPath.join(" -> ")}</CardDescription>
        </CardContent>
        <Button className="bg-black text-white" onClick={handlePlayAgain}>
          Zagraj jeszcze raz!
        </Button>
      </Card>
    </div>
  );

  return (
    <div>
      {quizCompleted ? renderResults() : renderQuestion()}
    </div>
  );
};

export default QuizPage;
