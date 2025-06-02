import * as Headless from '@headlessui/react';
import { Field, Label } from './fieldset';
import { Radio, RadioGroup } from './radio';
import clsx from 'clsx';
import { Tooltip } from 'react-tooltip';

export default function RadioButtons({
  value,
  setValue,
  options,
}: {
  className?: string;
  value: string;
  setValue: (value: string) => void;
  options: { label: string; value: string; jupiter?: boolean }[];
} & Omit<Headless.RadioGroupProps, 'as' | 'className'>) {
  return (
    <>
      <RadioGroup value={value} aria-label="Token supply" className="flex flex-wrap gap-4">
        {options.map((option) => (
          <Field
            key={option.label}
            onClick={() => setValue(option.value)}
            className={clsx(
              value === option.value
                ? 'dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-zinc-600'
                : 'dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-800',
              'space-y-0 flex flex-grow items-center gap-2 p-3 rounded-md cursor-pointer transition-colors'
            )}
          >
            <Radio value={option.value}></Radio>
            <Label className="flex items-center gap-2 w-full">
              <div className="w-full">{option.label}</div>
              {option.jupiter && (
                <div
                  className=""
                  data-tooltip-id="jupiter-tradeable"
                  data-tooltip-content="Always tradeable on Jupiter"
                  data-tooltip-place="top"
                >
                  <img src="/images/jupiter.svg" className="w-6 h-6" />
                </div>
              )}
            </Label>
          </Field>
        ))}
      </RadioGroup>
      <Tooltip id="jupiter-tradeable" />
    </>
  );
}
