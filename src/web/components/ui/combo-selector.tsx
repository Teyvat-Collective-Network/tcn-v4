"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function ComboMultiSelector({
    values,
    selected,
    setSelected,
    placeholder = "Select an item...",
    autoclose = false,
}: {
    values: { value: string; label: string }[];
    selected: string[];
    setSelected: (selected: string[]) => unknown;
    placeholder?: string;
    autoclose?: boolean;
}) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[320px] justify-between">
                    {selected.length === 0
                        ? placeholder
                        : selected.length === 1
                        ? values.find((item) => item.value === selected[0])?.label ?? selected[0]
                        : `${selected.length} values selected`}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
                <Command>
                    <CommandInput placeholder={placeholder} className="h-9" />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {values.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={() => {
                                        setSelected(
                                            selected.includes(item.value) ? selected.filter((value) => value !== item.value) : [...selected, item.value],
                                        );

                                        if (autoclose) setOpen(false);
                                    }}
                                >
                                    <span>{item.label}</span>
                                    <CheckIcon className={cn("ml-auto h-4 w-4", selected.includes(item.value) ? "opacity-100" : "opacity-0")} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export function ComboSelector({
    values,
    value,
    setValue,
    placeholder = "Select an item...",
}: {
    values: { value: string; label: string }[];
    value: string | null;
    setValue: (value: string | null) => unknown;
    placeholder?: string;
}) {
    return (
        <ComboMultiSelector
            values={values}
            selected={value === null ? [] : [value]}
            setSelected={(selected) => (selected.length === 0 ? setValue(null) : setValue(selected.find((item) => item !== value) ?? null))}
            placeholder={placeholder}
            autoclose
        ></ComboMultiSelector>
    );
}
