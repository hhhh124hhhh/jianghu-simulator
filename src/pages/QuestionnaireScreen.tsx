import { useState } from 'react';
import { questionnaire } from '../data/questionnaire';
import { Button, OptionButton } from '../components/Button';
import { QuestionnaireAnswers } from '../types/game';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionnaireScreenProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
}

export const QuestionnaireScreen = ({
  onComplete,
}: QuestionnaireScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});

  const question = questionnaire[currentQuestion];
  const isLastQuestion = currentQuestion === questionnaire.length - 1;
  const canProceed = answers[question.id as keyof QuestionnaireAnswers];

  const handleNext = () => {
    if (isLastQuestion && canProceed) {
      onComplete(answers as QuestionnaireAnswers);
    } else if (canProceed) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSelectOption = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background-near p-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* 进度指示器 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              问题 {currentQuestion + 1} / {questionnaire.length}
            </span>
            <span className="text-gold-primary font-semibold">
              {Math.round(
                ((currentQuestion + 1) / questionnaire.length) * 100
              )}
              %
            </span>
          </div>
          <div className="h-2 bg-background-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-primary to-gold-light transition-all duration-500"
              style={{
                width: `${((currentQuestion + 1) / questionnaire.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* 问题标题 */}
        <div className="bg-background-dark border border-border-subtle rounded-lg p-8">
          <h2 className="text-h1 md:text-h1 font-title font-bold text-gold-primary">
            {question.question}
          </h2>
        </div>

        {/* 选项 */}
        <div className="space-y-4">
          {question.options.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              description={`${option.label} - ${option.description}`}
              onClick={() => handleSelectOption(option.value)}
              selected={
                answers[question.id as keyof QuestionnaireAnswers] ===
                option.value
              }
            />
          ))}
        </div>

        {/* 属性预览 */}
        {canProceed && (
          <div className="bg-background-dark/50 border border-gold-primary/30 rounded-lg p-6 animate-fade-in">
            <h4 className="text-body font-semibold text-text-primary mb-3">
              该选项将影响：
            </h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(
                question.options.find(
                  (opt) =>
                    opt.value ===
                    answers[question.id as keyof QuestionnaireAnswers]
                )?.effects || {}
              ).map(([key, value]) => (
                <span
                  key={key}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    value > 0
                      ? 'bg-semantic-success/20 text-semantic-success'
                      : 'bg-semantic-error/20 text-semantic-error'
                  }`}
                >
                  {key === 'martial' && '武艺'}
                  {key === 'fame' && '威望'}
                  {key === 'network' && '人脉'}
                  {key === 'energy' && '内力'}
                  {key === 'virtue' && '侠义值'} {value > 0 ? '+' : ''}
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 导航按钮 */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handleBack}
            variant="text"
            size="lg"
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            上一题
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            {isLastQuestion ? '开始冒险' : '下一题'}
            {!isLastQuestion && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
