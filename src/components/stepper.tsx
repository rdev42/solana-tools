import clsx from 'clsx';
import { StepperStatus } from '../types';

type StepperProps = {
  steps: {
    name: string;
    status: StepperStatus;
  }[];
  className?: string;
};

export function Stepper(props: StepperProps) {
  return (
    <ol
      className={clsx(
        'flex flex-col lg:flex-row gap-3 justify-center items-center w-full p-3 space-x-2  font-medium text-center text-gray-500 border border-zinc-800 rounded-lg shadow-sm dark:text-gray-400 sm:p-4 sm:space-x-4 rtl:space-x-reverse',
        props.className
      )}
    >
      {props.steps.map((step, index) => {
        return (
          <li
            key={index}
            className={clsx(
              'flex items-center',
              step.status === 'done' && 'text-green-600 dark:text-green-500',
              step.status === 'loading' && 'text-blue-600 dark:text-blue-500 animate-pulse',
              step.status === 'waiting' && 'text-gray-500 dark:text-gray-400'
            )}
          >
            <span
              className={clsx(
                'flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0',
                step.status === 'done' && 'border-green-600 dark:border-green-500',
                step.status === 'loading' && 'border-blue-600 dark:border-blue-500 animate-pulse',
                step.status === 'waiting' && 'border-gray-500 dark:border-gray-400'
              )}
            >
              {index + 1}
            </span>
            {step.name}
            {props.steps[index + 1] && (
              <svg
                className="hidden md:block w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 12 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m7 9 4-4-4-4M1 9l4-4-4-4"
                />
              </svg>
            )}
          </li>
        );
      })}
    </ol>
  );
}
