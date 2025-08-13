import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Food } from "@/models/Food"

interface ComboboxAlimentosProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  foods: Food[];
}

export function ComboboxAlimentos({ value, onChange, disabled, foods }: ComboboxAlimentosProps) {
  const [open, setOpen] = React.useState(false)
  const allFoods = [{ id: 0, name: "Todos los Alimentos" } as Food, ...foods];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between font-normal w-[300px]"
          disabled={disabled}
        >
          {value !== undefined && value !== null
            ? allFoods.find((food) => food.id === value)?.name
            : "Todos los Alimentos"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput className="h-9" />
          <CommandList>
            <CommandEmpty>No encontrado</CommandEmpty>
            <CommandGroup className="max-h-50">
              {allFoods.map((food) => (
                <CommandItem
                  key={food.id}
                  value={food.name}
                  onSelect={(currentValue) => {
                    const selectedFood = allFoods.find(
                      (f) => f.name.toLowerCase() === currentValue.toLowerCase()
                    );
                    if (selectedFood) {
                      if (selectedFood.id === value) {
                        // do nothing
                      } else {
                        onChange(selectedFood.id);
                      }
                    }
                    setOpen(false);
                  }}
                >
                  {food.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === food.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}