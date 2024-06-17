"use client";
import { useState, useEffect } from "react";
import { NextPage } from "next";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/../hooks/useUser";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface Question {
    question_id: number;
    quiz_id: number;
    question_text: string | null;
    content: string | null;
    correct_answer: string;
    options: string[] | null;
}

const QuizPage: NextPage = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [currentDecisionPath, setCurrentDecisionPath] = useState<string[]>([]);
    const { user } = useUser();

    const router = useRouter();
    const pathName = usePathname();

    const match = pathName.match(/\/quiz\/([^/]+)\/test/);
    const subject = match ? match[1] : null;
    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data: quizData, error: quizError } = await supabase
                    .from("quizzes")
                    .select("quiz_id")
                    .eq("description", subject)
                    .single();

                if (quizError) {
                    throw quizError;
                }

                if (quizData) {
                    const { data: questionsData, error: questionsError } = await supabase
                        .from("Questions")
                        .select("*")
                        .eq("quiz_id", quizData.quiz_id);

                    if (questionsError) {
                        throw questionsError;
                    }

                    if (questionsData) {
                        const questionsWithParsedOptions = questionsData.map((question) => ({
                            ...question,
                            options: Array.isArray(question.options)
                                ? question.options
                                : JSON.parse(question.options || "[]"),
                        }));

                        setQuestions(questionsWithParsedOptions);
                    }
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        };

        fetchQuestions();
    }, [subject]);

    const handleSelectAnswer = (selectedAnswer: string) => {
        const updatedAnswers = [...userAnswers, selectedAnswer];
        setUserAnswers(updatedAnswers);

        const { path } = traverseDecisionTree(updatedAnswers, questions);
        setCurrentDecisionPath(path);

        if (currentQuestionIndex === questions.length - 1) {
            setQuizCompleted(true);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePlayAgain = () => {
        router.back();
    };

    useEffect(() => {
        if (quizCompleted) {
            const { result } = traverseDecisionTree(userAnswers, questions);
            saveTestResults(result);
        }
    }, [quizCompleted]);

    const renderQuestion = () => (
        <div className="flex justify-center pb-12">
            <div className="flex flex-col mt-16 m-6 h-max bg-gray-200 p-12 border-2 border-gray-600 rounded-2xl shadow-2xl">
                <div className="center-content font-sans text-center">
                    {currentQuestion ? (
                        <>
                            <div className="text-2xl font-bold mb-6 flex justify-center">
                                {currentQuestion.question_text}
                            </div>
                            {currentQuestion.content && (
                                <div className="question-image">
                                    {currentQuestion.content.endsWith(".jpg") || currentQuestion.content.endsWith(".png") ? (
                                        <img src={currentQuestion.content} alt="Question" className="max-w-full h-auto" />
                                    ) : (
                                        <iframe
                                            width="560"
                                            height="315"
                                            src={currentQuestion.content}
                                            title="Question Video"
                                            allowFullScreen
                                            className="max-w-full"
                                        />
                                    )}
                                </div>
                            )}

                            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                {(currentQuestion.options || []).map((option: any, index: number) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSelectAnswer(option)}
                                        className="bg-white m-2 rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <strong>{String.fromCharCode(65 + index)}</strong> - {option}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-bold">Aktualna gałąź drzewa decyzyjnego:</h3>
                    <p>{currentDecisionPath.join(" -> ")}</p>
                </div>
            </div>
        </div>
    );

    const renderResults = () => {
        const { result, path } = traverseDecisionTree(userAnswers, questions);

        return (
            <div className="flex justify-center mt-6">
                <Card className="flex flex-col mt-12 m-6 h-max lg:p-8 p-4 rounded-2xl border shadow-2xl border-gray-400">
                    <CardHeader>
                        <CardTitle>Test ukończony</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-black">Wynik: {result}</CardDescription>
                        <CardDescription className="text-black">Ścieżka: {path.join(" -> ")}</CardDescription>
                        <table className="table-auto w-full text-left">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Pytanie</th>
                                    <th className="px-4 py-2">Odpowiedź</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((question, index) => (
                                    <tr key={question.question_id}>
                                        <td className="border px-4 py-2">{question.question_text}</td>
                                        <td className="border px-4 py-2">{userAnswers[index]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                    <Button className="bg-black text-white" onClick={handlePlayAgain}>
                        Wypełnij test ponownie!
                    </Button>
                </Card>
            </div>
        );
    };


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

    const traverseDecisionTree = (answers: string[], questions: Question[]) => {
        let node: DecisionTreeNode = decisionTree;
        const path = [...currentDecisionPath];

        // Initialize path if it's empty
        if (path.length === 0) {
            path.push(node.question);
        }

        for (let i = 0; i < answers.length; i++) {
            const question = questions[i];
            const answer = answers[i];

            // If the final node is reached, stop updating the path
            if (typeof node === "string") {
                break;
            }

            // Ensure we match the question text with the decision tree node
            if (question.question_text === node.question) {
                if (node.options && node.options[answer]) {
                    node = node.options[answer] as DecisionTreeNode;
                    if (!path.includes(node.question)) {
                        path.push(node.question);
                    }
                    if (typeof node === "string") {
                        if (!path.includes(node)) {
                            path.push(node); // Add the final result to the path
                        }
                        return { result: node, path }; // Final diagnosis
                    }
                } else {
                    return { result: "Invalid answer path", path }; // If the path is invalid
                }
            }
        }

        return { result: node.question, path }; // Return the last node as the result
    };

    const saveTestResults = async (result: string) => {
        let testType = "psychiczne";
        let illness = result;
        let depressionScore = null;

        // Save to Supabase
        const { error } = await supabase
            .from("completed_tests")
            .insert([
                {
                    user_id: user?.id,
                    test_type: testType,
                    illness: illness,
                    depression_score: depressionScore,
                    user_answers: userAnswers,
                },
            ]);

        if (error) {
            console.error("Error saving test results:", error);
        }
    };

    return (
        <div>
            {quizCompleted ? renderResults() : renderQuestion()}
        </div>
    );
};

export default QuizPage;
