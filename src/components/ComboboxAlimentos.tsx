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
  hideTodos?: boolean;
}

export function ComboboxAlimentos({ value, onChange, disabled, foods, hideTodos }: ComboboxAlimentosProps) {
  const [open, setOpen] = React.useState(false)
  const allFoods = hideTodos ? foods : [{ id: 0, name: "(Todos)" } as Food, ...foods];

  // Simplified display logic
  const getDisplayText = () => {
    const selectedFood = allFoods.find(food => food.id === value);

    if (selectedFood) {
      return selectedFood.name;
    }

    // When no selection and hideTodos is true, show nbsp
    if (hideTodos) {
      return "\u00A0"; // Unicode non-breaking space
    }

    // Default fallback
    return "(Todos)";
  };

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
          {getDisplayText()}
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
                    if (selectedFood && selectedFood.id !== value) {
                      onChange(selectedFood.id);
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