"use client";

import { useMemo } from "react";
import { COUNTRIES, getCountryByCode, splitPhone } from "@/lib/country-codes";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
};

export function PhoneInput({
  value,
  onChange,
  required,
  placeholder = "11 2233 4455",
  className,
  id,
}: PhoneInputProps) {
  const { country, localNumber } = useMemo(() => splitPhone(value), [value]);

  function emit(dialCode: string, local: string) {
    const cleanLocal = local.replace(/[^\d]/g, "");
    onChange(cleanLocal ? `${dialCode}${cleanLocal}` : "");
  }

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = getCountryByCode(e.target.value);
    if (next) emit(next.dialCode, localNumber);
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    emit(country.dialCode, e.target.value);
  }

  return (
    <div className={`flex gap-2 ${className ?? ""}`}>
      <select
        aria-label="Código de país"
        value={country.code}
        onChange={handleCountryChange}
        className="shrink-0 rounded-lg border border-neutral-300 px-2 py-3 text-base focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.dialCode}
          </option>
        ))}
      </select>
      <input
        id={id}
        required={required}
        type="tel"
        inputMode="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
      />
    </div>
  );
}
