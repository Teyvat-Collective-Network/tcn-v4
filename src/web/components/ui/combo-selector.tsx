"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

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
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[320px] justify-between">
                    {value ? values.find((item) => item.value === value)?.label : placeholder}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50"></CaretSortIcon>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
                <Command>
                    <CommandInput placeholder={placeholder} className="h-9"></CommandInput>
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {values.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={() => {
                                        setValue(item.value === value ? null : item.value);
                                        setOpen(false);
                                    }}
                                >
                                    <span>{item.label}</span>
                                    <CheckIcon className={cn("ml-auto h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")}></CheckIcon>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
