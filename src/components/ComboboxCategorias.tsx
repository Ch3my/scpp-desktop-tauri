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
import { useAppState } from "@/AppState"

export function ComboboxCategorias() {
  const [open, setOpen] = React.useState(false)
  // The value state will now store the ID of the selected category
  const [value, setValue] = React.useState("")
  const { categorias } = useAppState()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between font-normal"
        >
          {value
            ? categorias.find((framework) => String(framework.id) === value)?.descripcion
            : <>&nbsp;</>}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput className="h-9" />
          <CommandList>
            <CommandEmpty>No encontrado</CommandEmpty>
            <CommandGroup className="max-h-40">
              {categorias.map((framework) => (
                <CommandItem
                  key={framework.id}
                  // Set the value prop to the description for searching
                  value={framework.descripcion}
                  onSelect={(currentValue) => {
                    // Find the category by its description to get its ID
                    const selectedCategory = categorias.find(
                      (cat) => cat.descripcion === currentValue
                    );
                    // Update the state with the selected ID
                    setValue(selectedCategory?.id === value ? "" : String(selectedCategory?.id));
                    setOpen(false);
                  }}
                >
                  {framework.descripcion}
                  <Check
                    className={cn(
                      "ml-auto",
                      // Compare the stored ID with the current item's ID for the checkmark
                      value === String(framework.id) ? "opacity-100" : "opacity-0"
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