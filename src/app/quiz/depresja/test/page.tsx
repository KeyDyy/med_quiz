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
    const [totalPoints, setTotalPoints] = useState<number>(0);
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

    useEffect(() => {
        if (quizCompleted) {
            saveTestResults();
        }
    }, [quizCompleted]);

    const handleSelectAnswer = (selectedAnswer: string, index: number) => {
        const updatedAnswers = [...userAnswers, selectedAnswer];
        setUserAnswers(updatedAnswers);

        // Calculate points based on the selected answer index
        const points = index; // 0-based index corresponds to point values: 0, 1, 2, 3
        setTotalPoints(totalPoints + points);

        if (currentQuestionIndex === questions.length - 1) {
            setQuizCompleted(true);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePlayAgain = () => {
        const parentPath = pathName.split('/').slice(0, -1).join('/');
        router.push(parentPath);
    };

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
                                        onClick={() => handleSelectAnswer(option, index)}
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
            </div>
        </div>
    );

    const getDepressionSeverity = (points: number) => {
        if (points <= 10) return "Zmiany samopoczucia są uważane za normalne";
        if (points <= 16) return "Łagodne zaburzenia nastroju";
        if (points <= 20) return "Depresja kliniczna typu borderline";
        if (points <= 30) return "Umiarkowana depresja";
        if (points <= 40) return "Ciężka depresja";
        return "Skrajna depresja";
    };

    const renderResults = () => (
        <div className="flex justify-center mt-6">
            <Card className="flex flex-col mt-12 m-6 h-max lg:p-8 p-4 rounded-2xl border shadow-2xl border-gray-400">
                <CardHeader>
                    <CardTitle>Test ukończony</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-black">Suma punktów: {totalPoints}</CardDescription>
                    <CardDescription className="text-black">Ocena: {getDepressionSeverity(totalPoints)}</CardDescription>
                    <CardDescription className="text-black">
                        Znaczenie:
                        {totalPoints <= 10 && (
                            <span>
                                Twoje odpowiedzi sugerują, że doświadczasz typowych wahań nastroju, które są częścią normalnego zakresu doświadczeń emocjonalnych.
                            </span>
                        )}
                        {totalPoints > 10 && totalPoints <= 16 && (
                            <span>
                                Twoje odpowiedzi wskazują na pewne łagodne problemy z nastrojem, które mogą wymagać uwagi, ale nie są jeszcze bardzo poważne.
                            </span>
                        )}
                        {totalPoints > 16 && totalPoints <= 20 && (
                            <span>
                                Twoje odpowiedzi sugerują, że możesz doświadczać objawów depresji, które są na granicy diagnozy klinicznej. Może być wskazane skonsultowanie się z profesjonalistą.
                            </span>
                        )}
                        {totalPoints > 20 && totalPoints <= 30 && (
                            <span>
                                Twoje odpowiedzi wskazują na umiarkowaną depresję. Ważne jest, aby poszukać pomocy, aby poprawić swoje samopoczucie i funkcjonowanie.
                            </span>
                        )}
                        {totalPoints > 30 && totalPoints <= 40 && (
                            <span>
                                Twoje odpowiedzi wskazują na ciężką depresję. Zaleca się natychmiastowe skonsultowanie się z lekarzem lub terapeutą, aby uzyskać odpowiednie wsparcie i leczenie.
                            </span>
                        )}
                        {totalPoints > 40 && (
                            <span>
                                Twoje odpowiedzi wskazują na bardzo poważny stan depresyjny. Niezwykle ważne jest, aby niezwłocznie poszukać profesjonalnej pomocy medycznej.
                            </span>
                        )}
                    </CardDescription>
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

    const saveTestResults = async () => {
        let testType = "depresja";
        let illness = null;
        let depressionScore = totalPoints;

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
